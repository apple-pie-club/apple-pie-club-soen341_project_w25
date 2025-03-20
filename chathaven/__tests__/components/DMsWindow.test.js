import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import DMsWindow from '../../src/components/DMsWindow';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUser = { _id: "0", email: "email@test.com", firstname: "testFirstname", lastname: "testLastname", isGlobalAdmin: false };

describe('DMsWindow', () => {
    test("renders the DMsWindow buttons", async () => {
        await act(async () => {
            render(<DMsWindow selectedUser={mockUser} sidebarOpen={true} />);
        });

        expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    });
});