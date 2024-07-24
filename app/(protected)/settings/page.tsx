import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/logout";

const SettingsPage = async () => {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session)}
      <form action={logout}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
};

export default SettingsPage;
