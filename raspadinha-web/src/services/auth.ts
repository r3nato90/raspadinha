import { apiServer } from "./apiServer"

export interface CreateAccountDto {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  termsAccepted?: boolean
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
}

export const authService = {
  async register(data: CreateAccountDto): Promise<AuthResponse> {
    const response = await apiServer.post("/accounts", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      termsAccepted: data.termsAccepted,
    })
    return response.data
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiServer.post("/auth", {
      email: data.email,
      password: data.password,
    })
    return response.data
  },
}
