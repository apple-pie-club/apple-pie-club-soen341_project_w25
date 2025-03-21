import DashboardPage from "../components/Dashboard";
import { SocketProvider } from "../components/SocketContext";

export default function Dashboard() {
  return (
    <SocketProvider>
      <div>
        <DashboardPage />
      </div>
    </SocketProvider>
  );
}
