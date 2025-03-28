import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from '../../src/pages/login';

jest.mock('next/router', () => require('next-router-mock'));

describe("LoginPage", () => {
    test("renders login form elements", async () => {
        await act(async () => {
            render(<LoginPage />);
        });

        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    test("updates email and password state on input", async () => {
        await act(async () => {
            render(<LoginPage />);
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

    test("shows error message on failed login", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: "Invalid credentials" }),
            })
        );

        await act(async () => {
            render(<LoginPage />);
        });

        act(() => {
            fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "wrong@example.com" }, });
            fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrongpassword" }, });
        });
        act(() => {
            fireEvent.click(screen.getByRole("button", { name: /login/i }));
        });

        await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
    });
});