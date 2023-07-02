# 環境構築
$ npm ci
$ npx prisma migrate reset

# アプリ起動
$ npm start

# 起動後、 http://localhost:3000 でアクセス可能
#  users:
#   - id: admin, password: admin
#   - id: user, password: user

# git 登録(https://github.com/oya3/node-express-app.git のアドレスの場合)
$ git remote add origin git@github.com:oya3/node-express-app.git
$ git remote -vv
origin git@github.com:oya3/node-express-app.git (fetch)
origin git@github.com:oya3/node-express-app.git (push)
