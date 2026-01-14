import { User } from './User'

type UserRowProps = {
  user: User
}

export function UserRow({ user }: UserRowProps) {
  return (
    <tr className={`user ${user.role} ${user.isActive ? 'active' : 'disabled'}`}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>{user.isActive ? 'Active' : 'Disabled'}</td>
    </tr>
  )
}
