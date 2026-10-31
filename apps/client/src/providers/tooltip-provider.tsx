import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type PropsWithChildren,
  type ReactElement,
} from "react";

interface TooltipContextValue {
  enabled: boolean;
}

const TooltipContext = createContext<TooltipContextValue>({ enabled: true });

export function TooltipProvider({ children }: PropsWithChildren) {
  return (
    <TooltipContext.Provider value={{ enabled: true }}>
      {children}
    </TooltipContext.Provider>
  );
}

type TooltipChildProps = {
  title?: string;
  "aria-label"?: string;
};

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactElement<TooltipChildProps>;
}) {
  const { enabled } = useContext(TooltipContext);

  if (!enabled || !label) {
    return children;
  }

  if (!isValidElement(children)) {
    return children;
  }

  const childProps = children.props as TooltipChildProps;

  return cloneElement(children as ReactElement<TooltipChildProps>, {
    title: childProps.title ?? label,
    "aria-label": childProps["aria-label"] ?? label,
  });
}

export function useTooltip() {
  return useContext(TooltipContext);
}
