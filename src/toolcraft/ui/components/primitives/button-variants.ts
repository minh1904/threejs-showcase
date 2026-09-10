// Server-safe copy of the button cva.
// Split out of button.tsx (which is "use client") so React Server Components
// can call buttonVariants() directly — e.g. to style a next/link as a button.
// This is a local divergence from upstream pixel-point/toolcraft.

import { cva } from "class-variance-authority";

import { pressedSelectedItemClassName } from "./selection-state";

function interactiveStateClassName(params: {
  active: string;
  hover: string;
  persistent: string;
}): string {
  const focus = params.hover.replaceAll("hover:", "focus:");

  return [params.hover, focus, params.active, params.persistent].join(" ");
}

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-[color:var(--ring)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--ring)_30%,transparent)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[color:var(--destructive)] aria-invalid:ring-2 aria-invalid:ring-[color:color-mix(in_oklab,var(--destructive)_20%,transparent)] dark:aria-invalid:border-[color:color-mix(in_oklab,var(--destructive)_50%,transparent)] dark:aria-invalid:ring-[color:color-mix(in_oklab,var(--destructive)_40%,transparent)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_[data-icon]]:opacity-60 [&_[data-icon]]:transition-opacity hover:[&_[data-icon]]:opacity-100 data-[size=icon]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon-tight]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon-tight]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon-tight]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon-xxs]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon-xxs]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon-xxs]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon-xs]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon-xs]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon-xs]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon-sm]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon-sm]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon-sm]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon-lg]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon-lg]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon-lg]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon-xl]:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-60 data-[size=icon-xl]:[&_svg:not([data-slot='primitive-arrow-icon'])]:transition-opacity data-[size=icon-xl]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[icon-active=true]:[&_[data-icon]]:!opacity-100 data-[icon-active=true]:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100",
  {
    variants: {
      motion: {
        default: "",
        static: "",
      },
      radius: {
        default: "rounded-lg",
        full: "rounded-full",
        lg: "rounded-lg",
        md: "rounded-md",
        sm: "rounded-md",
        "tab-control": "button-radius-tab-control",
        xl: "rounded-xl",
      },
      variant: {
        default: `bg-[color:var(--primary)] text-[color:var(--primary-foreground)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--primary)_82%,black)]",
            hover:
              "hover:bg-[color:color-mix(in_oklab,var(--primary)_88%,black)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--primary)_88%,black)] aria-pressed:bg-[color:color-mix(in_oklab,var(--primary)_82%,black)] data-open:bg-[color:color-mix(in_oklab,var(--primary)_88%,black)] data-popup-open:bg-[color:color-mix(in_oklab,var(--primary)_88%,black)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--primary)_88%,black)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--primary)_82%,black)]",
          },
        )}`,
        outline: `border-[color:color-mix(in_oklab,var(--border)_12%,transparent)] bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--input)_15%,transparent)] active:text-[color:var(--foreground)]",
            hover:
              "hover:!border-[color:color-mix(in_oklab,var(--border)_20%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--input)_15%,transparent)] hover:text-[color:var(--foreground)]",
            persistent: `aria-expanded:border-[color:color-mix(in_oklab,var(--border)_45%,transparent)] aria-expanded:bg-[color:color-mix(in_oklab,var(--input)_15%,transparent)] aria-expanded:text-[color:var(--foreground)] data-open:border-[color:color-mix(in_oklab,var(--border)_45%,transparent)] data-open:bg-[color:color-mix(in_oklab,var(--input)_15%,transparent)] data-open:text-[color:var(--foreground)] data-popup-open:border-[color:color-mix(in_oklab,var(--border)_45%,transparent)] data-popup-open:bg-[color:color-mix(in_oklab,var(--input)_15%,transparent)] data-popup-open:text-[color:var(--foreground)] data-[state=open]:border-[color:color-mix(in_oklab,var(--border)_45%,transparent)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--input)_15%,transparent)] data-[state=open]:text-[color:var(--foreground)] ${pressedSelectedItemClassName}`,
          },
        )}`,
        "outline-inverted": `border-[color:color-mix(in_oklab,var(--background)_15%,transparent)] text-[color:color-mix(in_oklab,var(--background)_70%,transparent)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] active:text-[color:var(--background)]",
            hover:
              "hover:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] hover:text-[color:var(--background)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] aria-expanded:text-[color:var(--background)] aria-pressed:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] aria-pressed:text-[color:var(--background)] data-open:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] data-open:text-[color:var(--background)] data-popup-open:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] data-popup-open:text-[color:var(--background)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] data-[state=open]:text-[color:var(--background)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--background)_10%,transparent)] data-[pressed]:text-[color:var(--background)]",
          },
        )}`,
        "destructive-outline": `border-[color:color-mix(in_oklab,var(--destructive)_80%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_80%,transparent)] text-[color:var(--destructive-foreground)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)]",
            hover:
              "hover:border-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] aria-pressed:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-open:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-popup-open:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)]",
          },
        )} focus-visible:border-[color:var(--destructive)] focus-visible:ring-[color:color-mix(in_oklab,var(--destructive)_20%,transparent)] dark:focus-visible:ring-[color:color-mix(in_oklab,var(--destructive)_40%,transparent)]`,
        "destructive-outline-inverted": `border-[color:color-mix(in_oklab,var(--destructive)_80%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_80%,transparent)] text-[color:var(--destructive-foreground)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)]",
            hover:
              "hover:border-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] aria-pressed:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-open:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-popup-open:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--destructive)_70%,transparent)]",
          },
        )} focus-visible:border-[color:var(--destructive)] focus-visible:ring-[color:color-mix(in_oklab,var(--destructive)_20%,transparent)]`,
        secondary: `bg-[color:color-mix(in_oklab,var(--secondary)_8%,transparent)] text-[color:var(--secondary-foreground)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)]",
            hover:
              "hover:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)] aria-pressed:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)] data-open:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)] data-popup-open:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--secondary)_20%,transparent)]",
          },
        )}`,
        "ghost-static": `bg-clip-border text-[color:var(--foreground)] ${interactiveStateClassName(
          {
            active:
              "active:bg-transparent active:text-[color:var(--foreground)]",
            hover: "hover:bg-transparent hover:text-[color:var(--foreground)]",
            persistent:
              "aria-expanded:bg-transparent aria-expanded:text-[color:var(--foreground)] aria-pressed:bg-transparent aria-pressed:text-[color:var(--foreground)] data-open:bg-transparent data-open:text-[color:var(--foreground)] data-popup-open:bg-transparent data-popup-open:text-[color:var(--foreground)] data-[state=open]:bg-transparent data-[state=open]:text-[color:var(--foreground)] data-[pressed]:bg-transparent data-[pressed]:text-[color:var(--foreground)]",
          },
        )}`,
        send: `bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)] !text-[color:color-mix(in_oklab,var(--background)_80%,transparent)] hover:!text-[color:color-mix(in_oklab,var(--background)_80%,transparent)] active:!text-[color:color-mix(in_oklab,var(--background)_80%,transparent)] [&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 active:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon]:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100 data-[size=icon]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100 data-[size=icon]:active:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100 ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]",
            hover:
              "hover:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)] aria-pressed:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)] data-open:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)] data-popup-open:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]",
          },
        )}`,
        stop: `bg-[color:var(--foreground)] !text-[color:color-mix(in_oklab,var(--background)_90%,transparent)] hover:!text-[color:color-mix(in_oklab,var(--background)_90%,transparent)] active:!text-[color:color-mix(in_oklab,var(--background)_90%,transparent)] [&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 active:[&_svg:not([data-slot='primitive-arrow-icon'])]:opacity-100 data-[size=icon]:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100 data-[size=icon]:hover:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100 data-[size=icon]:active:[&_svg:not([data-slot='primitive-arrow-icon'])]:!opacity-100 ${interactiveStateClassName(
          {
            active: "active:bg-[color:var(--foreground)]",
            hover: "hover:bg-[color:var(--foreground)]",
            persistent:
              "aria-expanded:bg-[color:var(--foreground)] aria-pressed:bg-[color:var(--foreground)] data-open:bg-[color:var(--foreground)] data-popup-open:bg-[color:var(--foreground)] data-[state=open]:bg-[color:var(--foreground)] data-[pressed]:bg-[color:var(--foreground)]",
          },
        )}`,
        ghost: `bg-clip-border text-[color:var(--foreground)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] active:text-[color:var(--foreground)]",
            hover:
              "hover:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] hover:text-[color:var(--foreground)]",
            persistent: `aria-expanded:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] aria-expanded:text-[color:var(--foreground)] data-open:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] data-open:text-[color:var(--foreground)] data-popup-open:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] data-popup-open:text-[color:var(--foreground)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] data-[state=open]:text-[color:var(--foreground)] ${pressedSelectedItemClassName}`,
          },
        )}`,
        "ghost-muted": `bg-clip-border text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] active:text-[color:var(--foreground)]",
            hover:
              "hover:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] hover:text-[color:var(--foreground)]",
            persistent: `aria-expanded:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] aria-expanded:text-[color:var(--foreground)] data-open:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] data-open:text-[color:var(--foreground)] data-popup-open:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] data-popup-open:text-[color:var(--foreground)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--input)_10%,transparent)] data-[state=open]:text-[color:var(--foreground)] ${pressedSelectedItemClassName}`,
          },
        )}`,
        destructive: `border-[color:color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_15%,transparent)] text-[color:var(--destructive)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] active:text-[color:var(--destructive)]",
            hover:
              "hover:border-[color:color-mix(in_oklab,var(--destructive)_60%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] hover:text-[color:var(--destructive)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] aria-expanded:text-[color:var(--destructive)] aria-pressed:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] aria-pressed:text-[color:var(--destructive)] data-open:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] data-open:text-[color:var(--destructive)] data-popup-open:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] data-popup-open:text-[color:var(--destructive)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] data-[state=open]:text-[color:var(--destructive)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] data-[pressed]:text-[color:var(--destructive)]",
          },
        )} focus-visible:border-[color:var(--destructive)] focus-visible:ring-[color:color-mix(in_oklab,var(--destructive)_20%,transparent)] dark:focus-visible:ring-[color:color-mix(in_oklab,var(--destructive)_40%,transparent)]`,
        "link-solid": `bg-[color:var(--link)] text-[color:var(--background)] ${interactiveStateClassName(
          {
            active:
              "active:bg-[color:color-mix(in_oklab,var(--link)_82%,black)]",
            hover: "hover:bg-[color:color-mix(in_oklab,var(--link)_88%,black)]",
            persistent:
              "aria-expanded:bg-[color:color-mix(in_oklab,var(--link)_88%,black)] aria-pressed:bg-[color:color-mix(in_oklab,var(--link)_82%,black)] data-open:bg-[color:color-mix(in_oklab,var(--link)_88%,black)] data-popup-open:bg-[color:color-mix(in_oklab,var(--link)_88%,black)] data-[state=open]:bg-[color:color-mix(in_oklab,var(--link)_88%,black)] data-[pressed]:bg-[color:color-mix(in_oklab,var(--link)_82%,black)]",
          },
        )}`,
        link: `text-[color:var(--primary)] underline-offset-4 ${interactiveStateClassName(
          {
            active: "active:underline",
            hover: "hover:underline",
            persistent:
              "aria-expanded:underline aria-pressed:underline data-open:underline data-popup-open:underline data-[state=open]:underline data-[pressed]:underline",
          },
        )}`,
        "toolbar-ghost": "",
        "toolbar-secondary": "",
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-[13px] leading-[1.125rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xxs: "h-[18px] gap-1 px-1.5 text-[11px] has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg:not([class*='size-'])]:size-2.5",
        xs: "h-[22px] gap-1 px-2 text-[12px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-[34px] gap-1 px-3.5 text-sm/relaxed tracking-tight has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        xl: "button-xl-icon-size h-10 gap-1.5 px-3 text-sm/relaxed has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        icon: "size-7 text-[13px] leading-[1.125rem] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-tight":
          "h-7 px-1.5 text-[13px] leading-[1.125rem] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xxs":
          "size-[18px] text-[11px] [&_svg:not([class*='size-'])]:size-2.5",
        "icon-xs":
          "size-[22px] text-[12px] [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm":
          "size-6 text-xs/relaxed [&_svg:not([class*='size-'])]:size-3",
        "icon-lg":
          "size-[34px] text-sm/relaxed tracking-tight [&_svg:not([class*='size-'])]:size-4",
        "icon-xl": "button-xl-icon-size size-10 text-sm/relaxed",
      },
    },
    defaultVariants: {
      motion: "default",
      radius: "default",
      variant: "default",
      size: "default",
    },
  },
);

export { buttonVariants };
