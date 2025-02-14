import { useRouter } from "next/router";

export default function HomePage() {
    const router = useRouter();

    return (
      <div className="">
        <h1 className="">
          ChatHaven
        </h1>
        <p id="loginText">Welcome to ChatHaven!</p>
        <div className="">
          <button
            onClick={() => router.push('/login')}
            className=""
          >
            Login
          </button>
          <button
            onClick={() => router.push('/register')}
            id="loginButton"
          >
            Register
          </button>
        </div>
        <div>
          <button
            onClick={() => router.push('/register')}
            className=""
          >
            Get started
          </button>
        </div>
      </div>
    );
}