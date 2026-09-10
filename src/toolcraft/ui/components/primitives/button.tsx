"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps } from "class-variance-authority";

import { useButtonLoadingState } from "./internal/button-loading";
import { buttonVariants } from "./button-variants";
import type { LoaderSize } from "./animated-loader";
import { cn } from "../../lib/utils";

type ButtonIconWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

function stepUpButtonIconWeight(weight: unknown): ButtonIconWeight {
  switch (weight) {
    case "thin":
      return "light";
    case "light":
      return "regular";
    case "regular":
      return "bold";
    case "bold":
    case "duotone":
    case "fill":
      return weight;
    default:
      return "bold";
  }
}

function getReactElementTypeName(
  type: string | React.JSXElementConstructor<unknown>,
): string | null {
  if (typeof type === "string") {
    return type;
  }

  const componentType = type as {
    displayName?: string;
    name?: string;
    render?:
      | {
          displayName?: string;
          name?: string;
        }
      | ((...args: never[]) => unknown);
  };

  if (
    typeof componentType.displayName === "string" &&
    componentType.displayName.length > 0
  ) {
    return componentType.displayName;
  }

  if (typeof componentType.name === "string" && componentType.name.length > 0) {
    return componentType.name;
  }

  if (typeof componentType.render === "function") {
    const renderComponent = componentType.render as {
      displayName?: string;
      name?: string;
    };
    return renderComponent.displayName || renderComponent.name || null;
  }

  return null;
}

function isSteppableButtonIconElement(
  element: React.ReactElement<{
    children?: React.ReactNode;
    weight?: ButtonIconWeight;
  }>,
): boolean {
  const typeName = getReactElementTypeName(element.type);
  return typeName?.endsWith("Icon") ?? false;
}

function shouldStepButtonIconWeight(_size: ButtonSize): boolean {
  return false;
}

function withSteppedButtonIconWeight(
  children: React.ReactNode,
  enabled: boolean,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (
      !React.isValidElement<{
        children?: React.ReactNode;
        weight?: ButtonIconWeight;
      }>(child)
    ) {
      return child;
    }

    const nextChildren =
      child.props.children === undefined
        ? child.props.children
        : withSteppedButtonIconWeight(child.props.children, enabled);

    if (!enabled) {
      return nextChildren === child.props.children
        ? child
        : React.cloneElement(child, undefined, nextChildren);
    }

    if (isSteppableButtonIconElement(child)) {
      const nextWeight = stepUpButtonIconWeight(child.props.weight);

      return nextChildren === child.props.children
        ? React.cloneElement(child, { weight: nextWeight })
        : React.cloneElement(child, { weight: nextWeight }, nextChildren);
    }

    return nextChildren === child.props.children
      ? child
      : React.cloneElement(child, undefined, nextChildren);
  });
}


type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    "data-slot"?: string;
    loading?: boolean;
    loadingWidth?: LoaderSize;
    loadingHeight?: LoaderSize;
    loadingIndicatorClassName?: string;
  };

function shouldUseCompactButtonLoadingHeight(
  size: VariantProps<typeof buttonVariants>["size"],
): boolean {
  return (
    size === "xxs" ||
    size === "xs" ||
    size === "sm" ||
    size === "icon-xxs" ||
    size === "icon-xs" ||
    size === "icon-sm"
  );
}

function Button({
  "aria-label": ariaLabel,
  "data-slot": dataSlot,
  children,
  className,
  disabled,
  loading = false,
  loadingHeight,
  loadingIndicatorClassName,
  loadingWidth,
  motion = "default",
  radius = "default",
  ref,
  size = "default",
  style,
  variant = "default",
  ...props
}: ButtonProps) {
  const resolvedRadius =
    radius === "default" && (size === "xxs" || size === "icon-xxs")
      ? "sm"
      : radius;
  const buttonChildren = withSteppedButtonIconWeight(
    children,
    shouldStepButtonIconWeight(size),
  );
  const {
    buttonAriaBusy,
    buttonAriaLabel,
    buttonClassName,
    buttonContent,
    buttonDisabled,
    buttonLoader,
    buttonRef,
    buttonStyle,
    dataLoading,
  } = useButtonLoadingState<HTMLButtonElement>({
    ariaLabel,
    children: buttonChildren,
    className,
    compactHeight: shouldUseCompactButtonLoadingHeight(size),
    disabled,
    iconOnly: typeof size === "string" && size.startsWith("icon"),
    loading,
    loadingHeight,
    loadingIndicatorClassName:
      loadingIndicatorClassName ??
      (variant === "default"
        ? "bg-[color:var(--primary-foreground)]"
        : variant === "link-solid"
          ? "bg-[color:var(--background)]"
          : undefined),
    loadingWidth,
    measurementKey: [motion, resolvedRadius, size, variant].join(":"),
    ref,
    style,
  });

  return (
    <ButtonPrimitive
      {...props}
      aria-label={buttonAriaLabel}
      aria-busy={buttonAriaBusy}
      data-slot={dataSlot ?? "button"}
      data-loading={dataLoading}
      data-radius={resolvedRadius ?? undefined}
      data-size={size ?? undefined}
      data-variant={variant ?? undefined}
      disabled={buttonDisabled}
      ref={buttonRef}
      className={cn(
        buttonVariants({ motion, radius: resolvedRadius, variant, size }),
        className,
        buttonClassName,
      )}
      style={buttonStyle}
    >
      {buttonContent}
      {buttonLoader}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
