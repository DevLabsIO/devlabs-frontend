import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CoursesLayout({
    student,
    faculty,
}: {
    student: React.ReactNode;
    faculty: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user;
    if (!user) {
        return redirect("/login");
    }
    const userGroups = user?.groups || [];
    if ((userGroups as string[]).includes("student")) {
        return <>{student}</>;
    }
    if (
        (userGroups as string[]).includes("faculty") ||
        (userGroups as string[]).includes("manager")
    ) {
        return <>{faculty}</>;
    }

    return <div>Unauthorized</div>;
}
