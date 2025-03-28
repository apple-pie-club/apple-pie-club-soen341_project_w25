import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import AddUserToChannelMenu from '../../src/components/AddUserToChannelMenu';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([{ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false },]),
    })
);

const mockChannel = { _id: "0" };
const mockTeam = { _id: "0" };

describe('AddUserToChannelMenu', () => {
    test("renders the AddUserToChannelMenu buttons", async () => {
        await act(async () => {
            render(<AddUserToChannelMenu isOpen={true} selectedChannel={mockChannel} selectedTeam={mockTeam} />);
        });

        expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
    });

    test("renders nothing when the menu is closed", async () => {
        await act(async () => {
            render(<AddUserToChannelMenu isOpen={false} />);
        });

        expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `);
    });
});