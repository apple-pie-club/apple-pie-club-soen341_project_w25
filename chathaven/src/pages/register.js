import RegisterForm from "../components/RegisterForm";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div>
      <RegisterForm onRegister={() => router.push("/login")} />
    </div>
  );
}
