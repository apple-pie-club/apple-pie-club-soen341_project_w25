import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SocketClient from '../../src/components/SocketClient';
import { useSocket } from '../../src/components/SocketContext';

jest.mock('../../src/components/SocketContext', () => ({
    useSocket: jest.fn(),
}));

global.fetch = jest.fn();

describe('SocketClient', () => {
    const mockSocket = { emit: jest.fn() };
    const mockUserId = '1111';
    const mockUpdateStatus = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useSocket.mockReturnValue({
            socket: mockSocket,
            userId: mockUserId,
            status: 'available',
            usersStatus: {
                testUser1: 'available',
                testUser2: 'unavailable',
                testUser3: 'away'
            },
            userNames: {
                testUser1: 'Joe Joe',
                testUser2: 'Jane Jane',
                testUser3: 'Dave Dave'
            },
            updateStatus: mockUpdateStatus
        });

        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { userId: 'testUser1', lastActiveTime: '2025-01-01T01:00:00Z' },
                { userId: 'testUser3', lastActiveTime: '2025-01-12T12:00:00Z' }
            ])
        });
    });

    test('calls available functionality', async () => {
        await act(async () => {
            render(<SocketClient />);
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Set Status to Available'));
        });

        expect(mockUpdateStatus).toHaveBeenCalledWith('available');
    });

    test('calls unavailable functionality', async () => {
        await act(async () => {
            render(<SocketClient />);
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Set Status to Unavailable'));
        });

        expect(mockUpdateStatus).toHaveBeenCalledWith('unavailable');
    });

    test('emits available status on component mount', async () => {
        await act(async () => {
            render(<SocketClient />);
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('message', mockUserId, 'available');
    });

    test('fetches last active time', async () => {
        await act(async () => {
            render(<SocketClient />);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/lastactivetime');
    });

    test('displays last active times properly', async () => {
        await act(async () => {
            render(<SocketClient />);
        });

        await waitFor(() => {
            const personEntry = screen.getByText(/Dave Dave/);
            expect(personEntry).toBeInTheDocument();
            expect(personEntry.textContent).toContain('Last active:');
        });
    });

    test('handles API error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        await act(async () => {
            render(<SocketClient />);
        });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching last active time:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    test('renders user status and buttons', async () => {
        await act(async () => {
            render(<SocketClient />);
        });

        expect(screen.getByText('Set Status to Available')).toBeInTheDocument();
        expect(screen.getByText('Set Status to Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Away')).toBeInTheDocument();
        expect(screen.getByText('Unavailable')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Dave Dave/)).toBeInTheDocument();
            expect(screen.getByText(/Last active:/)).toBeInTheDocument();
        });
    });
});