type UserCardProps = {
  firstName: string
  lastName: string
  isPremium: boolean
  roles: string[]
}

export function UserCard({ firstName, lastName, isPremium, roles }: UserCardProps) {
  const userName = `${firstName} ${lastName}`
  const uniqueRoles = [...new Set(roles)]

  return (
    <div className="user-card">
      {isPremium && <span className="user-card-badge">Premium</span>}
      <div className="user-card-name">{userName}</div>
      <ul className="user-card-roles">
        {uniqueRoles.map((role) => (
          <li key={role}>{role}</li>
        ))}
      </ul>
    </div>
  )
}
