import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CreateChannelMenu from '../../src/components/CreateChannelMenu';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUser = { _id: "0", email: "email@test.com", firstname: "testFirstname", lastname: "testLastname", isGlobalAdmin: false };
const mockTeamMembers = [mockUser];

describe('CreateChannelMenu', () => {
    test("renders the CreateChannelMenu buttons", async () => {
        await act(async () => {
            render(<CreateChannelMenu teamMembers={mockTeamMembers} isOpen={true} />);
        });

        expect(screen.getByRole("button", { name: /Create Channel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });

    test("renders nothing when the menu is closed", async () => {
        await act(async () => {
            render(<CreateChannelMenu isOpen={false} />);
        });

        expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `);
    });

    test("can select users", async () => {
        await act(async () => {
            render(<CreateChannelMenu teamMembers={mockTeamMembers} isOpen={true} />);
        });

        act(() => {
            fireEvent.click(screen.getByRole("checkbox", { name: "" }));
        });

        expect(screen.getByRole("button", { name: /Create Channel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });
});