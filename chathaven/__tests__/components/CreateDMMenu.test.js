import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CreateDMMenu from '../../src/components/CreateDMMenu';

beforeEach(() => {
    jest.clearAllMocks();
});

global.fetch = jest.fn();

describe('EditProfileMenu', () => {
    test("renders the EditProfileMenu page with the correct text", async () => {
        await act(async () => {
            render(<CreateDMMenu isOpen={true} />);
        });

        expect(screen.getByRole("button", { name: /Start DM/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });

    test("renders nothing when the menu is closed", async () => {
        await act(async () => {
            render(<CreateDMMenu isOpen={false} />);
        });

        expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `);
    });

    test("renders the EditProfileMenu page with the correct options", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve([
                    { _id: "0", email: "email@test.com", firstname: "testFirstname", lastname: "testLastname", isGlobalAdmin: false },
                ]),
        });

        await act(async () => {
            render(<CreateDMMenu isOpen={true} />);
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith("/api/users");
    });

    test("clicking submit causes an alert", async () => {
        let alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        await act(async () => {
            render(<CreateDMMenu isOpen={true} />);
        });

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: /Start DM/i }));
        });

        expect(alertSpy).toHaveBeenCalledTimes(1);
        alertSpy.mockRestore();
    });
});