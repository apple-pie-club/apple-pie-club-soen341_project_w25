import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import RequestToJoinChannelMenu from '../../src/components/RequestToJoinChannelMenu';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([{ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false },]),
    })
);

const mockUserId = 1 ;
const mockTeam = { _id: "0" };

describe('RequestToJoinChannelMenu', () => {
    test("renders the RequestToJoinChannelMenu buttons", async () => {
        await act(async () => {
            render(<RequestToJoinChannelMenu isOpen={true} selectedTeam={mockTeam} userId={mockUserId} />);
        });

        expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
    });

    test("renders nothing when the menu is closed", async () => {
        await act(async () => {
            render(<RequestToJoinChannelMenu isOpen={false} />);
        });

        expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `);
    });
});