import { Session } from "next-auth";
import { Button } from "./ui/button";
import { logout } from "@/actions/logout";

interface SessionProps {
  session: Session;
}

export const DashBoard = ({ session }: SessionProps) => {
  return (
    <div className=" flex flex-col h-full bg-slate-500">
      <span className="text-orange-500">{JSON.stringify(session)} </span>
      <form action={logout}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
};
