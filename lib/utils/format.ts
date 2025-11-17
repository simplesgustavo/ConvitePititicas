const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit"
});

const pluralFormatter = new Intl.PluralRules("pt-BR");

export function formatDateTimeForInvite(date: Date) {
  return dateTimeFormatter.format(date);
}

export function formatPluralGuests(amount: number) {
  const rule = pluralFormatter.select(amount);
  switch (rule) {
    case "one":
      return `${amount} acompanhante`;
    default:
      return `${amount} acompanhantes`;
  }
}
