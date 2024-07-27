import { Button } from "./ui/button";
import { logout } from "@/actions/logout";

export const DashBoard = () => {
  return (
    <div className=" flex flex-col h-full bg-slate-500">
      <span className="text-orange-500">user is logged in </span>
      <form action={logout}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
};
