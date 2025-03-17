import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CreateTeamMenu from '../../src/components/CreateTeamMenu';

global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false },
        ]),
    })
  );

describe('CreateTeamMenu', () => {
    test("renders the CreateTeamMenu buttons", async () => {
        await act(async () => {
            render(<CreateTeamMenu isOpen={true} />);
        });

        expect(screen.getByRole("button", { name: /Create Team/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });

    test("renders nothing when the menu is closed", async () => {
        await act(async () => {
            render(<CreateTeamMenu isOpen={false} />);
        });

        expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `);
    });

    test("clicking submit causes an alert", async () => {
        let alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        await act(async () => {
            render(<CreateTeamMenu isOpen={true} />);
        });

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: /Create Team/i }));
        });

        expect(alertSpy).toHaveBeenCalledTimes(1);
        alertSpy.mockRestore();
    });
});