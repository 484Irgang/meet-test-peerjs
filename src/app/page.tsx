export default function Home() {
  return (
    <div className="w-full h-full bg-dark-300 flex flex-1 items-center justify-center flex-col">
      <div className="m-auto p-4 rounded-lg bg-dark-200 flex items-center justify-center flex-col gap-y-4">
        <h1 className="text-[1.75rem] font-bold">Bem vindo</h1>
        <div className="w-full min-w-60 flex flex-col gap-y-2">
          <p className="font-bold text-sm text-neutral-400">
            Insira o ID da sala:{" "}
          </p>
          <input
            type="text"
            className="w-full rounded-sm border border-neutral-900 bg-dark-100 h-8"
          />
          <button className="w-full h-[2.75rem] rounded-sm bg-brand-600 mt-4">
            Entrar
          </button>
          <button className="w-full h-[2.75rem] rounded-sm border border-neutral-400 mt-2">
            Criar uma sala
          </button>
        </div>
      </div>
    </div>
  );
}
