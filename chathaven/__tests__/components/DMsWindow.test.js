import '@testing-library/jest-dom';
import { userEvent } from "@testing-library/user-event";
import { render, screen, act } from '@testing-library/react';
import DMsWindow from '../../src/components/DMsWindow';
import { afterEach } from 'node:test';

const user = userEvent.setup();

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUser = { _id: "0", email: "email@test.com", firstname: "testFirstname", lastname: "testLastname", isGlobalAdmin: false };

describe('DMsWindow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        let alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    afterEach(() => {
        alertSpy.mockRestore();
    });

    test("renders the DMsWindow buttons", async () => {
        await act(async () => {
            render(<DMsWindow selectedUser={mockUser} sidebarOpen={true} />);
        });

        expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    });

    test("sending a message", async () => {
        await act(async () => {
            render(<DMsWindow selectedUser={mockUser} sidebarOpen={true} />);
        });

        const input = screen.getByPlaceholderText("Type a message...");

        await act(async () => {
            await user.type(input, "test user message");
            await user.keyboard('{Enter}');
        });

        expect(global.fetch).toHaveBeenCalled();
    });

    test("attempting to send a blank message is ignored", async () => {
        await act(async () => {
            render(<DMsWindow selectedUser={mockUser} sidebarOpen={true} />);
        });

        const input = screen.getByPlaceholderText("Type a message...");

        await act(async () => {
            await user.keyboard('{Enter}');
        });

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});