type PrintButtonProps = {
  href: string;
};

export function PrintButton({ href }: PrintButtonProps) {
  return (
    <a className="btn btn-primary" href={href}>
      Download PDF card
    </a>
  );
}
