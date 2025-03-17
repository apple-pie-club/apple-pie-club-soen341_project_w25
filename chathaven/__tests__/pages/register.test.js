import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from "@testing-library/react";
import RegisterPage from '../../src/pages/register';

jest.mock('next/router', () => require('next-router-mock'));

describe("RegisterPage", () => {
    test("renders register form elements", async () => {
        await act(async () => {
            render(<RegisterPage />);
        });

        expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    test("updates first name and last name input field", async () => {
        await act(async () => {
            render(<RegisterPage />);
        });

        const firstNameInput = screen.getByPlaceholderText("First Name")
        const lastNameInput = screen.getByPlaceholderText("Last Name")

        act(() => {
            fireEvent.change(firstNameInput, { target: { value: "testFirstName" } });
            fireEvent.change(lastNameInput, { target: { value: "testLastName" } });
        });

        expect(firstNameInput.value).toBe("testFirstName");
        expect(lastNameInput.value).toBe("testLastName");
    });

    test("updates email and password state on input", async () => {
        await act(async () => {
            render(<RegisterPage />);
        });

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");

        act(() => {
            fireEvent.change(emailInput, { target: { value: "test@test.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });
        });

        expect(emailInput.value).toBe("test@test.com");
        expect(passwordInput.value).toBe("password123");
    });
});