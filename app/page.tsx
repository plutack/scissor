import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";

export default function Home() {
  return (
    <main className="flex flex-col h-full justify-center items-center bg-gradient-to-b from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold text-white drop-shadow-md">
          {" "}
          EVENTFUL
        </h1>
        <div>
          <LoginButton>
            <Button size="lg">Sign In</Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
