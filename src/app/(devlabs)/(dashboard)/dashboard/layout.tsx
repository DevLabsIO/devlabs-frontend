import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    admin,
    manager,
    faculty,
    student,
}: {
    admin: React.ReactNode;
    manager: React.ReactNode;
    faculty: React.ReactNode;
    student: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return redirect("/login");
    }

    const userGroups = user?.groups || [];
    const userRoles = user?.roles || [];

    if ((userRoles as string[]).includes("ADMIN") || (userGroups as string[]).includes("admin")) {
        return <>{admin}</>;
    }

    if (
        (userRoles as string[]).includes("MANAGER") ||
        (userGroups as string[]).includes("manager")
    ) {
        return <>{manager}</>;
    }

    if (
        (userRoles as string[]).includes("FACULTY") ||
        (userGroups as string[]).includes("faculty")
    ) {
        return <>{faculty}</>;
    }

    if (
        (userRoles as string[]).includes("STUDENT") ||
        (userGroups as string[]).includes("student")
    ) {
        return <>{student}</>;
    }

    return <div>Unauthorized</div>;
}
