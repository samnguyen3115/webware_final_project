import { NavLink } from "react-router-dom";

export default function DashboardHeader({
    schoolId,
    schoolYearId,
    onLogout,
    isAdmin,
    userRole,
}) {
    const tabClass = ({ isActive }) =>
        `relative flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg overflow-hidden transition-colors duration-300 group ${isActive
            ? "bg-[#FFA500] text-black"
            : "bg-white/10 text-white hover:bg-white/20"
        }`;

    return (
        <>
            {/* TOP HEADER */}
            <header className="sticky top-0 z-20 border-b bg-[#0F2D52] text-white shadow-lg">
                <nav
                    aria-label="Dashboard"
                    className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-10"
                >
                    {/* LEFT SIDE */}
                    <div className="min-w-0 flex-1">
                        {isAdmin ? (
                            <img
                                src="https://ospreysoftware.com/wp-content/uploads/Osprey-Logo-Parent-Company.FINAL-90h2.png"
                                alt="Osprey Software"
                                className="h-10 w-auto invert"
                            />
                        ) : (
                            <>
                                <h1 className="text-2xl font-semibold tracking-tight text-white">
                                    School Dashboard
                                </h1>

                                <p className="text-sm text-gray-300 mt-0.5">
                                    School ID:{" "}
                                    <span className="text-white">{schoolId}</span>
                                    {Number.isFinite(schoolYearId) && (
                                        <>
                                            {" "}
                                            • Year:{" "}
                                            <span className="text-white">
                                                {schoolYearId}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                            <NavLink to="/dashboard" className={tabClass}>
                                <span className="transition-all duration-300 group-hover:-translate-x-2">
                                    Dashboard
                                </span>
                                <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                    →
                                </span>
                            </NavLink>

                            <NavLink to="/peer-comparison" className={tabClass}>
                                <span className="transition-all duration-300 group-hover:-translate-x-2">
                                    Peer Comparison
                                </span>
                                <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                    →
                                </span>
                            </NavLink>

                            {userRole === "admin" && (
                                <NavLink to="/benchmark" className={tabClass}>
                                    <span className="transition-all duration-300 group-hover:-translate-x-2">
                                        Benchmark
                                    </span>
                                    <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        →
                                    </span>
                                </NavLink>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <button
                        type="button"
                        onClick={onLogout}
                        className="relative shrink-0 flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg overflow-hidden transition-colors duration-300 group bg-[#D94141] text-white hover:bg-[#B23030]"
                    >
                        <span className="transition-all duration-300 group-hover:-translate-x-2">
                            Logout
                        </span>
                        <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            →
                        </span>
                    </button>
                </nav>
            </header>
        </>
    );
}