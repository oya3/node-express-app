npm ci
npx prisma migrate reset
npm start
# 起動後、 http://localhost:3000 でアクセス可能
#  users:
#   - id: admin, password: admin
#   - id: user, password: user
