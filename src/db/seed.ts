async function main() {
  console.log("Seed desativado: o FitReport Pro usa somente dados reais criados por cadastro, alunos, avaliacoes e relatorios no banco.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
