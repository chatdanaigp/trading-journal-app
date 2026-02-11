export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-red-500">Authentication Error</h1>
                    <p className="text-gray-400">
                        Sorry, we couldn't complete your login with Discord.
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-left">
                    <h2 className="text-lg font-semibold text-white mb-3">Possible reasons:</h2>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
                        <li>You denied Discord permission</li>
                        <li>The authentication code expired</li>
                        <li>Discord OAuth is not configured correctly</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <a
                        href="/login"
                        className="inline-block w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Try Again
                    </a>
                    <a
                        href="/"
                        className="inline-block w-full border border-gray-700 hover:bg-gray-900 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    )
}
