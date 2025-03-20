import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import CMsWindow from '../../src/components/CMsWindow';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", email: "email@test.com", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUser = { _id: "0", email: "email@test.com", firstname: "testFirstname", lastname: "testLastname", isGlobalAdmin: false };
const mockChannel = { _id: "0", members: [mockUser] };

describe('CMsWindow', () => {
    test("renders the CMsWindow buttons", async () => {
        await act(async () => {
            render(<CMsWindow selectedChannel={mockChannel} />);
        });

        expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    });
});