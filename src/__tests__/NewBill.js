/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let fileInput, newBill, expense, date, amount, vat, pct, form
    let handleChangeFile, handleSubmit, updateBill

    beforeEach(() => {
      document.body.innerHTML = NewBillUI()
      form = screen.getByTestId("form-new-bill")
      fileInput = screen.getByTestId("file")
      expense = screen.getByTestId("expense-name")
      date = screen.getByTestId("datepicker")
      amount = screen.getByTestId("amount")
      vat = screen.getByTestId("vat")
      pct = screen.getByTestId("pct")

      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@tld.fr"
      }))

      newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store,
        localStorage: window.localStorage
      })

      handleSubmit = jest.fn(newBill.handleSubmit)
      handleChangeFile = jest.fn(newBill.handleChangeFile)
      updateBill = jest.spyOn(newBill, "updateBill")

      fileInput.addEventListener("change", handleChangeFile)
      form.addEventListener("submit", handleSubmit)
    })

    test("Then the image extension is correct.", () => {
      const image = new File([], "image.jpg", { type: "image/jpeg" });

      fireEvent.change(fileInput, { target: { files: [image] } });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("image.jpg");
    })

    test("then the image extension is not correct.", () => {
      const image = new File([], "image.mkv", { type: "image/jpeg" });

      const spy = jest.spyOn(console, "error")
      fireEvent.change(fileInput, { target: { files: [image] } })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(spy).toHaveBeenCalled()
    })

    test("then submit the form when click on button submit", async () => {
      const image = new File([], "image.jpg", { type: "image/jpeg" });

      fireEvent.change(fileInput, { target: { files: [image] } });
      fireEvent.change(expense, { target: { value: "bill name" } });
      fireEvent.change(date, { target: { value: "2024-02-01" } });
      fireEvent.change(amount, { target: { value: "23" } });
      fireEvent.change(vat, { target: { value: "23" } });
      fireEvent.change(pct, { target: { value: "23" } });

      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled();
      expect(updateBill).toHaveBeenCalled()
    })

    test("Then, store.bill.create reject promise", async () => {
      const mockStore = {
        bills: () => ({
          create: jest.fn().mockRejectedValue(new Error("create failed"))
        })
      }

      newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage
      })

      const image = new File([], "image.jpg", { type: "image/jpeg" });
      const spy = jest.spyOn(console, "error")

      fireEvent.change(fileInput, { target: { files: [image] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled()
    })

    test("Then, store.bill.update reject promise", async () => {
      const mockStore = {
        bills: () => ({
          create: jest.fn().mockResolvedValue(),
          update: jest.fn().mockRejectedValue(new Error("update failed"))
        })
      }

      newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage
      })

      const image = new File([], "image.jpg", { type: "image/jpeg" });
      const spy = jest.spyOn(console, "error")

      fireEvent.change(fileInput, { target: { files: [image] } });
      fireEvent.change(expense, { target: { value: "bill name" } });
      fireEvent.change(date, { target: { value: "2024-02-01" } });
      fireEvent.change(amount, { target: { value: "23" } });
      fireEvent.change(vat, { target: { value: "23" } });
      fireEvent.change(pct, { target: { value: "23" } });

      fireEvent.submit(form)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(handleSubmit).toHaveBeenCalled()
      expect(updateBill).toHaveBeenCalled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
