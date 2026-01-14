import { User } from './User'
import { UserRow } from '@/components/UserList/UserRow'

type UserListProps = {
  users: User[]
}

export function UserList({ users }: UserListProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={4}>No users available</td>
          </tr>
        ) : (
          users.map((user) => <UserRow key={user.id} user={user} />)
        )}
      </tbody>
    </table>
  )
}
