@echo off
chcp 65001 >nul
title Sistema de Inventario - SENA ADSO

echo =====================================================================
echo       SISTEMA DE GESTIÓN DE INVENTARIO - SENA ADSO (Ficha 3233929)
echo =====================================================================
echo.

:: 1. Verificar y liberar puerto 8080 si está ocupado por Tomcat de XAMPP
echo [1/3] Verificando puerto 8080...
powershell -NoProfile -Command ^
  "$p = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; " ^
  "if ($p) { " ^
  "  Write-Host '(!) Puerto 8080 ocupado (probablemente Tomcat de XAMPP). Liberando puerto...' -ForegroundColor Yellow; " ^
  "  Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue; " ^
  "  Write-Host '    Puerto 8080 liberado con exito.' -ForegroundColor Green; " ^
  "} else { " ^
  "  Write-Host '    Puerto 8080 disponible.' -ForegroundColor Green; " ^
  "}"

:: 2. Verificar MySQL (Puerto 3306)
echo.
echo [2/3] Verificando servicio de base de datos MySQL (puerto 3306)...
powershell -NoProfile -Command ^
  "$m = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue; " ^
  "if (-not $m) { " ^
  "  if (Test-Path 'C:\xampp\mysql_start.bat') { " ^
  "    Write-Host '(!) MySQL no esta ejecutandose. Iniciando MySQL de XAMPP...' -ForegroundColor Yellow; " ^
  "    Start-Process 'cmd.exe' -ArgumentList '/c C:\xampp\mysql_start.bat' -WindowStyle Hidden; " ^
  "    Start-Sleep -Seconds 3; " ^
  "  } " ^
  "  $m2 = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue; " ^
  "  if ($m2) { " ^
  "    Write-Host '    MySQL iniciado y conectado con exito.' -ForegroundColor Green; " ^
  "  } else { " ^
  "    Write-Host '(!) ATENCION: Por favor abre el panel de control de XAMPP y presiona START en MySQL.' -ForegroundColor Red; " ^
  "  } " ^
  "} else { " ^
  "  Write-Host '    MySQL esta activo y listo en el puerto 3306.' -ForegroundColor Green; " ^
  "}"

:: 3. Abrir el navegador en segundo plano tras iniciar
echo.
echo [3/3] Iniciando Servidor Backend (Spring Boot)...
powershell -NoProfile -Command ^
  "Start-Job -ScriptBlock { Start-Sleep -Seconds 7; Start-Process 'http://localhost:8080/index.html' } | Out-Null"

echo.
echo =====================================================================
echo  El servidor esta iniciando. Tu navegador se abrira automaticamente en:
echo  http://localhost:8080/index.html
echo.
echo  IMPORTANTE: Deja esta ventana abierta mientras uses el sistema.
echo  Para detener el sistema, simplemente cierra esta ventana.
echo =====================================================================
echo.

cd /d "%~dp0"
if exist "sistema-inventario" cd "sistema-inventario"

call mvnw.cmd spring-boot:run

pause
