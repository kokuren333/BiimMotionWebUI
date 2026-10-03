import { Children, type ReactNode } from "react";
import { Pop } from "./Pop";
export const Stagger = ({
  children,
  delay = 0,
  step = 5,
}: {
  children: ReactNode;
  delay?: number;
  step?: number;
}) => (
  <>
    {Children.toArray(children).map((child, i) => (
      <Pop key={i} delay={delay + i * step}>
        {child}
      </Pop>
    ))}
  </>
);
