import React from 'react';
import {
  Car,
  Building2,
  Smartphone,
  Sofa,
  Shirt,
  Briefcase,
  Wrench,
  Dog,
  Tag,
  ShoppingBag,
  Sparkles,
  Layers,
  Home,
  Laptop,
  Gamepad2,
  Tv,
  Zap,
  Camera,
  Watch,
  Compass,
  Heart,
  Star,
  Flame,
  Award,
  Gift,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Car,
  Building2,
  Smartphone,
  Sofa,
  Shirt,
  Briefcase,
  Wrench,
  Dog,
  Tag,
  ShoppingBag,
  Sparkles,
  Layers,
  Home,
  Laptop,
  Gamepad2,
  Tv,
  Zap,
  Camera,
  Watch,
  Compass,
  Heart,
  Star,
  Flame,
  Award,
  Gift,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent {...props} />;
};
