export default function DashboardHeader({
    schoolId,
    schoolYearId,
    onLogout,
}) {
    return (
        <header className="sticky top-0 z-10 border-b border-gray-300 bg-white/95 backdrop-blur">
            <nav aria-label="Dashboard" className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-black">School Dashboard</h1>
                    <p className="text-sm text-gray-700">
                        School ID: <span className="text-black">{schoolId}</span>
                        {Number.isFinite(schoolYearId) && (
                            <>
                                {' '}
                                • Year: <span className="text-black">{schoolYearId}</span>
                            </>
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onLogout}
                    className="shrink-0 rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
                >
                    Logout
                </button>
            </nav>
        </header>
    )
}