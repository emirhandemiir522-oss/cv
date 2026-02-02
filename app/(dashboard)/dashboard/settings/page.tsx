'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Lock, CreditCard, Bell, Trash2, Loader2, Check, AlertCircle, Eye, EyeOff, Shield, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UpgradeModal } from '@/components/dashboard/upgrade-modal'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('profile')
    const [showUpgrade, setShowUpgrade] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Profile State
    const [fullName, setFullName] = useState('')
    const [headline, setHeadline] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileSaved, setProfileSaved] = useState(false)

    // Password State
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    // Reset Password State
    const [resetEmail, setResetEmail] = useState('')
    const [sendingReset, setSendingReset] = useState(false)
    const [resetSent, setResetSent] = useState(false)

    useEffect(() => {
        loadUser()
    }, [])

    async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUser(user)
            setFullName(user.user_metadata?.full_name || '')
            setHeadline(user.user_metadata?.headline || '')
            setResetEmail(user.email || '')
        }
        setLoading(false)
    }

    async function saveProfile() {
        setSavingProfile(true)
        setProfileSaved(false)
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName, headline: headline }
            })
            if (error) throw error
            setProfileSaved(true)
            setTimeout(() => setProfileSaved(false), 3000)
        } catch (error: any) {
            alert('Failed to save: ' + error.message)
        } finally {
            setSavingProfile(false)
        }
    }

    async function changePassword() {
        setPasswordError('')
        setPasswordSuccess(false)

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }

        setChangingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })
            if (error) throw error
            setPasswordSuccess(true)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setPasswordSuccess(false), 3000)
        } catch (error: any) {
            setPasswordError(error.message)
        } finally {
            setChangingPassword(false)
        }
    }

    async function sendPasswordReset() {
        setSendingReset(true)
        setResetSent(false)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            })
            if (error) throw error
            setResetSent(true)
        } catch (error: any) {
            alert('Failed to send reset email: ' + error.message)
        } finally {
            setSendingReset(false)
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.')) {
            return
        }

        const confirmText = prompt('Type "DELETE" to confirm.')
        if (confirmText !== 'DELETE') return

        try {
            const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to delete account')

            await supabase.auth.signOut()
            router.push('/')
        } catch (error: any) {
            console.error(error)
            alert('Error deleting account: ' + error.message)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
    ]

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and subscription preferences.</p>
            </div>

            <div className="flex gap-8 relative z-0">
                {/* Sidebar Tabs */}
                <div className="w-48 shrink-0">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                                <p className="text-sm text-gray-500">Update your personal details.</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {user?.email}
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Verified</span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">Professional Headline</label>
                                    <input
                                        id="headline"
                                        type="text"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                {profileSaved && (
                                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Saved successfully
                                    </span>
                                )}
                                <div className="flex-1" />
                                <button
                                    onClick={saveProfile}
                                    disabled={savingProfile}
                                    className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <>
                            {/* Change Password */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Lock className="w-5 h-5" /> Change Password
                                    </h2>
                                    <p className="text-sm text-gray-500">Update your password to keep your account secure.</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-4 top-10 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                        />
                                    </div>
                                    {passwordError && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4" /> {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="flex items-center gap-2 text-green-600 text-sm">
                                            <Check className="w-4 h-4" /> Password updated successfully!
                                        </div>
                                    )}
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={changePassword}
                                        disabled={changingPassword || !newPassword || !confirmPassword}
                                        className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900">Forgot Password?</h2>
                                    <p className="text-sm text-gray-500">Send a password reset link to your email.</p>
                                </div>
                                <div className="p-6">
                                    <div className="flex gap-4">
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                        />
                                        <button
                                            onClick={sendPasswordReset}
                                            disabled={sendingReset || !resetEmail}
                                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {sendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                            Send Reset Link
                                        </button>
                                    </div>
                                    {resetSent && (
                                        <p className="mt-3 text-green-600 text-sm flex items-center gap-2">
                                            <Check className="w-4 h-4" /> Reset link sent! Check your email.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-red-100 bg-red-50">
                                    <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
                                    <p className="text-sm text-red-600">Irreversible actions. Proceed with caution.</p>
                                </div>
                                <div className="p-6">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SUBSCRIPTION TAB */}
                    {activeTab === 'subscription' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Subscription Plan</h2>
                                <p className="text-sm text-gray-500">Manage your subscription and billing.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">Free Trial</p>
                                        <p className="text-sm text-gray-500">You are on the free trial plan.</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">Active</span>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Pro Annual Plan</h3>
                                            <p className="text-gray-500 text-sm">Best value for professionals.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-gray-900">$70<span className="text-sm font-normal text-gray-500">/year</span></p>
                                            <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block mt-1">Save 40%</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-4 h-4 text-green-500" /> Unlimited Resumes
                                            </li>
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-4 h-4 text-green-500" /> AI Content Optimization
                                            </li>
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-4 h-4 text-green-500" /> Advanced ATS Checker
                                            </li>
                                        </ul>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-4 h-4 text-green-500" /> Cover Letter Generator
                                            </li>
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-4 h-4 text-green-500" /> Priority Support
                                            </li>
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-4 h-4 text-green-500" /> PDF & Word Exports
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => router.push('/pricing')}
                                        className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </div>
    )
}
