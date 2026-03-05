import { FaUser } from "react-icons/fa";

export default function DashboardHeader({
    schoolId,
    schoolYearId,
    onLogout,
}) {
    return (
        <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
            <nav aria-label="Dashboard" className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10 bg-[#19254A]">
                <div className="min-w-0">
                    <h1 className="text-3xl font-semibold tracking-tight text-white pb-4">School Dashboard</h1>
                    <p className="text-sm text-[#D6D6D6]">
                        School ID: <span className="text-[#D6D6D6]">{schoolId}</span>
                        {Number.isFinite(schoolYearId) && (
                            <>
                                {' '}
                                • Year: <span className="text-[#D6D6D6]">{schoolYearId}</span>
                            </>
                        )}
                    </p>
                </div>

                <div className='flex gap-2'>
                    {/*<FaUser/>*/}
                <button
                    type="button"
                    onClick={onLogout}
                    className="shrink-0 border-gray-400 bg-none px-4 py-2 text-20px font-medium text-white hover:text-[#00F2FF] hover:underline"
                >
                    Logout
                </button>
                </div>
            </nav>
        </header>
    )
}