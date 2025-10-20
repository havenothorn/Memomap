export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">개발자 후원</h1>
      <p className="mt-2 text-gray-600">
        MemoMap이 도움이 되셨다면 ☕ 커피 한 잔으로 응원해 주세요!
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <a
          className="rounded-2xl border p-4 text-center hover:shadow"
          href="#"
          target="_blank"
        >
          Buy Me a Coffee
        </a>
        <a
          className="rounded-2xl border p-4 text-center hover:shadow"
          href="#"
          target="_blank"
        >
          오픈카톡
        </a>
        <a
          className="rounded-2xl border p-4 text-center hover:shadow"
          href="#"
          target="_blank"
        >
          Toss / 후원 링크
        </a>
      </div>
    </div>
  );
}
