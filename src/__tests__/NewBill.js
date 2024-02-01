/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then add image in justificatif, ", () => {
      document.body.innerHTML = NewBillUI()
      const file = screen.getByTestId("file")
      
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: jest.fn(),
        localStorage: window.localStorage
      })

      
    })
  })
})
