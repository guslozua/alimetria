import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  IconButton, 
  Link,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Facebook,
  Instagram,
  WhatsApp,
  Email,
  Phone,
  LocationOn,
  X as TwitterX,
  YouTube
} from '@mui/icons-material';

// Importar los logos
import LogoOscuro from '../../assets/images/Logo-principal-fdo-oscuro.png';
import LogoPrincipalTransparente from '../../assets/images/Logo principal-fdo transparente.png';

// Para TikTok usaremos un SVG personalizado ya que MUI no tiene icono nativo
const TikTokIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Seleccionar el logo apropiado según el tema
  const logoSrc = isDarkMode ? LogoOscuro : LogoPrincipalTransparente;
  
  // Información del consultorio (esto podría venir de un contexto o configuración)
  const consultorioInfo = {
    direccion: "Av. Silvano Bores 297, San Miguel de Tucumán",
    telefono: "+54 381 123-4567",
    email: "info@alimetria.com",
    redes: {
      facebook: "https://facebook.com/alimetria",
      instagram: "https://instagram.com/alimetria", 
      whatsapp: "https://wa.me/5493811234567",
      twitter: "https://twitter.com/alimetria",
      youtube: "https://youtube.com/@alimetria",
      tiktok: "https://tiktok.com/@alimetria"
    }
  };

  const currentYear = new Date().getFullYear();

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${consultorioInfo.email}`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${consultorioInfo.telefono}`;
  };

  const handleAddressClick = () => {
    const encodedAddress = encodeURIComponent(consultorioInfo.direccion);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  // Colores optimizados para cada modo
  const footerStyles = {
    light: {
      bgcolor: 'grey.50',
      borderColor: 'divider',
      textPrimary: 'text.primary',
      textSecondary: 'text.secondary'
    },
    dark: {
      bgcolor: alpha(theme.palette.background.paper, 0.8),
      borderColor: alpha(theme.palette.divider, 0.1),
      textPrimary: 'grey.100',
      textSecondary: 'grey.400'
    }
  };

  const currentStyles = isDarkMode ? footerStyles.dark : footerStyles.light;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: currentStyles.bgcolor,
        borderTop: 1,
        borderColor: currentStyles.borderColor,
        mt: 'auto',
        py: { xs: 3, md: 4 },
        // Mejores estilos para modo oscuro
        ...(isDarkMode && {
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.default, 0.98)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        })
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo y descripción */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: { xs: 'center', md: 'flex-start' } 
            }}>
              <Box
                component="img"
                src={logoSrc}
                alt="Alimetria Logo"
                sx={{
                  height: { xs: 45, md: 55 },
                  width: 'auto',
                  mb: 2,
                  objectFit: 'contain'
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: 280,
                  lineHeight: 1.6,
                  color: currentStyles.textSecondary,
                  fontWeight: 400
                }}
              >
                Tu consultorio de nutrición de confianza. 
                Acompañándote en tu camino hacia una vida más saludable.
              </Typography>
            </Box>
          </Grid>

          {/* Información de contacto */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                textAlign: { xs: 'center', md: 'left' },
                color: currentStyles.textPrimary,
                mb: 2
              }}
            >
              Contacto
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateX(4px)'
                  }
                }}
                onClick={handleAddressClick}
              >
                <LocationOn sx={{ 
                  fontSize: 20, 
                  color: isDarkMode ? 'primary.light' : 'primary.main' 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: currentStyles.textSecondary,
                    lineHeight: 1.4 
                  }}
                >
                  {consultorioInfo.direccion}
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateX(4px)'
                  }
                }}
                onClick={handlePhoneClick}
              >
                <Phone sx={{ 
                  fontSize: 20, 
                  color: isDarkMode ? 'primary.light' : 'primary.main' 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ color: currentStyles.textSecondary }}
                >
                  {consultorioInfo.telefono}
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateX(4px)'
                  }
                }}
                onClick={handleEmailClick}
              >
                <Email sx={{ 
                  fontSize: 20, 
                  color: isDarkMode ? 'primary.light' : 'primary.main' 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ color: currentStyles.textSecondary }}
                >
                  {consultorioInfo.email}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Redes sociales */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                textAlign: { xs: 'center', md: 'left' },
                color: currentStyles.textPrimary,
                mb: 2
              }}
            >
              Síguenos
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 1,
                justifyContent: { xs: 'center', md: 'flex-start' },
                mb: 2,
                flexWrap: 'wrap'
              }}
            >
              <IconButton
                onClick={() => handleSocialClick(consultorioInfo.redes.facebook)}
                sx={{
                  color: currentStyles.textSecondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#1877F2',
                    bgcolor: alpha('#1877F2', 0.1),
                    borderColor: alpha('#1877F2', 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha('#1877F2', 0.2)}`
                  }
                }}
                aria-label="Facebook"
              >
                <Facebook />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick(consultorioInfo.redes.instagram)}
                sx={{
                  color: currentStyles.textSecondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#E4405F',
                    bgcolor: alpha('#E4405F', 0.1),
                    borderColor: alpha('#E4405F', 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha('#E4405F', 0.2)}`
                  }
                }}
                aria-label="Instagram"
              >
                <Instagram />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick(consultorioInfo.redes.twitter)}
                sx={{
                  color: currentStyles.textSecondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    bgcolor: alpha(isDarkMode ? '#ffffff' : '#000000', 0.1),
                    borderColor: alpha(isDarkMode ? '#ffffff' : '#000000', 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(isDarkMode ? '#ffffff' : '#000000', 0.2)}`
                  }
                }}
                aria-label="X (Twitter)"
              >
                <TwitterX />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick(consultorioInfo.redes.youtube)}
                sx={{
                  color: currentStyles.textSecondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#FF0000',
                    bgcolor: alpha('#FF0000', 0.1),
                    borderColor: alpha('#FF0000', 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha('#FF0000', 0.2)}`
                  }
                }}
                aria-label="YouTube"
              >
                <YouTube />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick(consultorioInfo.redes.tiktok)}
                sx={{
                  color: currentStyles.textSecondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    bgcolor: alpha(isDarkMode ? '#ffffff' : '#000000', 0.1),
                    borderColor: alpha(isDarkMode ? '#ffffff' : '#000000', 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(isDarkMode ? '#ffffff' : '#000000', 0.2)}`
                  }
                }}
                aria-label="TikTok"
              >
                <TikTokIcon />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick(consultorioInfo.redes.whatsapp)}
                sx={{
                  color: currentStyles.textSecondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#25D366',
                    bgcolor: alpha('#25D366', 0.1),
                    borderColor: alpha('#25D366', 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha('#25D366', 0.2)}`
                  }
                }}
                aria-label="WhatsApp"
              >
                <WhatsApp />
              </IconButton>
            </Box>

            <Typography
              variant="body2"
              sx={{
                textAlign: { xs: 'center', md: 'left' },
                lineHeight: 1.6,
                color: currentStyles.textSecondary,
                fontWeight: 400
              }}
            >
              Mantente conectado con nosotros para tips de nutrición, 
              recetas saludables y las últimas novedades.
            </Typography>
          </Grid>
        </Grid>

        {/* Divider mejorado */}
        <Divider 
          sx={{ 
            my: 3,
            borderColor: isDarkMode 
              ? alpha(theme.palette.primary.main, 0.1) 
              : 'divider'
          }} 
        />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' },
              color: currentStyles.textSecondary,
              fontWeight: 400
            }}
          >
            © {currentYear} Alimetria. Todos los derechos reservados.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, sm: 3 },
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <Link
              href="#"
              variant="body2"
              underline="hover"
              sx={{
                color: currentStyles.textSecondary,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Términos y Condiciones
            </Link>
            <Link
              href="#"
              variant="body2"
              underline="hover"
              sx={{
                color: currentStyles.textSecondary,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Política de Privacidad
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;