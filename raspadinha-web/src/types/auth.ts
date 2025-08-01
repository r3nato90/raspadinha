export interface IUser {
  id: string
  name: string
  email: string
  phone?: string
  document?: string
  role: "USER" | "ADMIN"
  balance: number
  affiliateCode?: string
  affiliateRate?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface CreateAccountDto {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  termsAccepted?: boolean
  referralCode?: string
}

export interface AuthResponse {
  token: string
  account: IUser
}

export interface DepositDto {
  document: string
  amount: number
}

export interface WithdrawDto {
  keyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM"
  key: string
  amount: number
}

export interface DepositResponse {
  qrCode: string
  transactionId: string
}

export interface AffiliateStats {
  affiliateCode: string
  totalReferrals: number
  totalEarnings: number
  referralLink: string
}

export interface AffiliateReferral {
  name: string
  email: string
  joinedAt: string
}
