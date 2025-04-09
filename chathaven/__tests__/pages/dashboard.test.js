import '@testing-library/jest-dom';
import { render, screen, act, fireEvent } from '@testing-library/react';
import DashboardPage from '../../src/pages/dashboard';

jest.mock('next/router', () => require('next-router-mock'));

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ _id: "1", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
    })
);

const mockUserRegular = { _id: "2", isGlobalAdmin: false };

describe('DashboardPage', () => {
    test("does not show 'Create Team' button for non global admins", async () => {
        await act(async () => {
            render(<DashboardPage user={mockUserRegular} loadingUser={false} />);
        });

        expect(screen.queryByText(/Create Team/i)).not.toBeInTheDocument();
    });

    test("can open the user status menu", async () => {
        await act(async () => {
            render(<DashboardPage user={mockUserRegular} />);
        });

        act(() => {
            fireEvent.click(screen.getByTestId('user-status-button'));
        });

        expect(global.fetch).toHaveBeenCalled();
        expect(screen.getByTitle('User Status')).toBeInTheDocument();
    });

    test("user status", async () => {
        await act(async () => {
            render(<DashboardPage user={mockUserRegular} />);
        });

        expect(screen.getByTestId('user-status-button')).toBeInTheDocument();
    });

    test("renders the dashboard page with the correct text", async () => {
        await act(async () => {
            render(<DashboardPage user={mockUserRegular} />);
        });

        expect(screen.getByText(/no teams yet/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    });

    test('renders the dashboard page buttons', async () => {
        await act(async () => {
            render(<DashboardPage user={mockUserRegular} loadingUser={false} />);
        });

        expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-sidebar-button')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-channel-sidebar-button')).toBeInTheDocument();
    });
});
