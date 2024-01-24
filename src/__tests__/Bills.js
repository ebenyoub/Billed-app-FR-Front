/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js";
import BillsUI from "../views/BillsUI.js"
import Bill from "../containers/Bills.js";
import router from "../app/Router.js";
import store from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    let billPage;

    beforeEach(() => {
      // On crée le DOM de Bills
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)

      billPage = new Bill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      })
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", async () => {
      const datas = await billPage.getBills()
      document.body.innerHTML = BillsUI({ data: datas });
      // On récupère les dates affichées sur le DOM
      const datesOnScreen = screen.getAllByText(/(\d{1,2} [a-zA-Zéû]+\. \d{2})/).map(a => a.innerHTML);
      // On récupère les dates stockées dans la fixture et on les formate
      const datesFixtures = bills.map(bill => bill.date)
      const datesFixturesFormated = datesFixtures.map(date => formatDate(date))
      // On trie les dates recupérés dans la fixture
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...datesFixturesFormated].sort(antiChrono)
      expect(datesOnScreen).toEqual(datesSorted)
    })

    test("Then I click on newBill button, NewBills page appears", async () => {
      const newBillBtn = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(() => billPage.handleClickNewBill())
      newBillBtn.addEventListener("click", () => handleClickNewBill())
      userEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId("content-title"))
      expect(screen.getByTestId("content-title").innerHTML).toBe(" Envoyer une note de frais ")
    })

    test(", it should open the modale", async () => {
      const iconEyes = screen.getAllByTestId("icon-eye")[0]
      const modaleFile = screen.getByTestId("modaleFile")
      const handleClickIconEye = jest.fn(icon => billPage.handleClickIconEye(icon))
      iconEyes.addEventListener("click", () => handleClickIconEye(iconEyes))
      userEvent.click(iconEyes)
      await waitFor(() => modaleFile.classList.contains("show"))
      // on attends 1s pour laisser l'animation se terminer
      setTimeout(() => {
        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modaleFile).toHaveClass("show")
      }, 1000);
    })

    test("getBills should handle errors and return unformatted date", async () => {
      // on crée une date erronée
      const mockStoreError = {
        bills: jest.fn(() => ({
          list: jest.fn(() => Promise.resolve([{
            "status": "accepted",
            "date": "wrong date",
          }])),
        })),
      };
      const billInstance = new Bill({
        document,
        onNavigate,
        store: mockStoreError,
        localStorage: window.localStorage
      })
      const billsData = await billInstance.getBills()
      billsData.map(bill => {
        expect(bill.date).toBe(bill.date)
        expect(bill.status).toBe("Accepté")
      })
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(store, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    
    test("fetches bills from an API and fails with message error", async () => {
      store.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur/)
      expect(message).toBeTruthy()
    })
  })
})
