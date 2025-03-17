import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import EditProfileMenu from '../../src/components/EditProfileMenu';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUser = { _id: "0", email: "email@test.com", firstname: "testFirstname", lastname: "testLastname", isGlobalAdmin: false };

describe('EditProfileMenu', () => {
    test("renders the EditProfileMenu page with the correct text", async () => {
        await act(async () => {
            render(<EditProfileMenu user={mockUser} isOpen={true} />);
        });

        expect(screen.getByDisplayValue(/testFirstname/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/testLastname/i)).toBeInTheDocument();
    });

    test("renders nothing when the menu is closed", async () => {
        await act(async () => {
            render(<EditProfileMenu user={mockUser} isOpen={false} />);
        });

        expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `);
    });

    test("renders the EditProfileMenu page with the correct options", async () => {
        await act(async () => {
            render(<EditProfileMenu user={mockUser} isOpen={true} />);
        });

        act(() => {
            fireEvent.click(screen.getByTestId('edit-button'));
        });

        expect(screen.getByDisplayValue(/testFirstname/i)).toBeInTheDocument();
    });

    test("allows the user to edit their profile", async () => {
        await act(async () => {
            render(<EditProfileMenu user={mockUser} isOpen={true} />);
        });
        
        await act(async () => {
            fireEvent.click(screen.getByTestId('edit-button'));
        });
        
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(screen.getByDisplayValue(/testFirstname/i)).toBeInTheDocument();
    });
});