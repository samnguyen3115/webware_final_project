import { NavLink } from "react-router-dom";

export default function DashboardHeader({
    schoolId,
    schoolYearId,
    onLogout,
    isAdmin,
    userRole,
}) {
    const tabClass = ({ isActive }) =>
        `rounded-lg border px-3 py-1.5 text-sm ${isActive
            ? "border-black bg-black text-white"
            : "border-gray-400 bg-white text-black hover:bg-gray-100"
        }`;

    return (
        <header className="sticky top-0 z-10 border-b border-gray-300 bg-white/95 backdrop-blur">
            <nav
                aria-label="Dashboard"
                className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10"
            >
                {/* LEFT SIDE */}
                <div className="min-w-0 flex-1">
                    {isAdmin ? (
                        <img
                            src="https://ospreysoftware.com/wp-content/uploads/Osprey-Logo-Parent-Company.FINAL-90h2.png"
                            alt="Osprey Software"
                            className="h-10 w-auto"
                        />
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold tracking-tight text-black">
                                School Dashboard
                            </h1>
                            <p className="text-sm text-gray-700">
                                School ID:{" "}
                                <span className="text-black">{schoolId}</span>
                                {Number.isFinite(schoolYearId) && (
                                    <>
                                        {" "}
                                        • Year:{" "}
                                        <span className="text-black">
                                            {schoolYearId}
                                        </span>
                                    </>
                                )}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <NavLink to="/dashboard" className={tabClass}>
                                    Dashboard
                                </NavLink>
                                <NavLink to="/peer-comparison" className={tabClass}>
                                    Peer Comparison
                                </NavLink>
                                {userRole === "admin" ? (
                                    <NavLink to="/benchmark" className={tabClass}>
                                        Benchmark
                                    </NavLink>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <button
                    type="button"
                    onClick={onLogout}
                    className="shrink-0 rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
                >
                    Logout
                </button>
            </nav>
        </header>
    );
}