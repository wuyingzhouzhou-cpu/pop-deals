import Link from "next/link"

export function AdminNotice({ databaseReady }: { databaseReady: boolean }) {
  if (databaseReady) {
    return null
  }

  return (
    <div className="notice">
      当前 2.0 后台正在使用演示数据。配置 `DATABASE_URL` 并执行{" "}
      <Link href="/admin/setup">setup</Link> 里的建表 SQL 后，下面的表单就会写入数据库。
    </div>
  )
}
