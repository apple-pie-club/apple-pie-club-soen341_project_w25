import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import DmsDashboardPage from '../../src/pages/dms';

jest.mock('next/router', () => require('next-router-mock'));

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUserRegular = { _id: "2", isGlobalAdmin: false };

describe('DmsDashboardPage', () => {
    test("renders the dashboard page with the correct text", async () => {
        await act(async () => {
            render(<DmsDashboardPage user={mockUserRegular} />);
        });

        expect(screen.getByText(/Direct Messages/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    });

    test('renders the dms dashboard page buttons', async () => {
        await act(async () => {
            render(<DmsDashboardPage user={mockUserRegular} loadingUser={false} />);
        });

        expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-sidebar-button')).toBeInTheDocument();
    });
});
