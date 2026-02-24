export default function DashboardHeader({
    schoolId,
    schoolYearId,
    onLogout,
}) {
    return (
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/75 backdrop-blur">
            <nav aria-label="Dashboard" className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">School Dashboard</h1>
                    <p className="text-sm text-slate-300">
                        School ID: <span className="text-slate-200">{schoolId}</span>
                        {Number.isFinite(schoolYearId) && (
                            <>
                                {' '}
                                • Year (SCHOOL_YR_ID): <span className="text-slate-200">{schoolYearId}</span>
                            </>
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onLogout}
                    className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                    Logout
                </button>
            </nav>
        </header>
    )
}