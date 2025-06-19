// Script para ejecutar la restauración completa del inventario
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://uznvakpuuxnpdhoejrog.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDQwNDAsImV4cCI6MjA2MjMyMDA0MH0.7fzeKx9jWsZWP_QDLmMok4DJbmqQY-vFEymHmZ3URb4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restaurarInventario() {
  console.log('🚀 INICIANDO RESTAURACIÓN COMPLETA DEL INVENTARIO...\n');

  try {
    // Paso 1: Script eliminado - Ruta11 ya no está disponible
    console.log('❌ El script de Ruta11 ha sido eliminado del proyecto');
    console.log('ℹ️  Este script necesita ser actualizado para el nuevo sistema de inventario');
    console.log('\n🛠️  Para restaurar inventario:');
    console.log('1. Ve a Supabase Dashboard');
    console.log('2. Abre el SQL Editor');
    console.log('3. Ejecuta manualmente los scripts de migración desde src/database/migrations/');

    return;

    // Paso 2: Dividir el script en comandos individuales
    console.log('\n2️⃣ Procesando comandos SQL...');
    const commands = sqlScript
      .split(';')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📋 Encontrados ${commands.length} comandos para ejecutar`);

    // Paso 3: Ejecutar comandos críticos primero
    console.log('\n3️⃣ Ejecutando comandos de estructura...');

    const structureCommands = commands.filter(
      (cmd) =>
        cmd.includes('CREATE EXTENSION') ||
        cmd.includes('DROP TABLE') ||
        cmd.includes('CREATE TABLE') ||
        cmd.includes('CREATE INDEX')
    );

    let successCount = 0;
    let errorCount = 0;

    for (const [index, command] of structureCommands.entries()) {
      try {
        console.log(`   Ejecutando comando ${index + 1}/${structureCommands.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: command });

        if (error) {
          console.log(`   ⚠️  Advertencia en comando ${index + 1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error en comando ${index + 1}: ${error.message}`);
        errorCount++;
      }

      // Pausa pequeña entre comandos
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`   ✅ Estructura creada: ${successCount} exitosos, ${errorCount} con errores`);

    // Paso 4: Ejecutar comandos de datos
    console.log('\n4️⃣ Insertando datos del inventario...');

    const dataCommands = commands.filter((cmd) => cmd.includes('INSERT INTO'));

    successCount = 0;
    errorCount = 0;

    for (const [index, command] of dataCommands.entries()) {
      try {
        console.log(`   Insertando datos ${index + 1}/${dataCommands.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: command });

        if (error) {
          console.log(`   ⚠️  Advertencia en inserción ${index + 1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error en inserción ${index + 1}: ${error.message}`);
        errorCount++;
      }

      // Pausa pequeña entre comandos
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`   ✅ Datos insertados: ${successCount} exitosos, ${errorCount} con errores`);

    // Paso 5: Verificar la restauración
    console.log('\n5️⃣ Verificando restauración...');

    const { count: totalArticulos, error: errorConteo } = await supabase
      .from('inventario')
      .select('*', { count: 'exact', head: true });

    if (errorConteo) {
      console.error('❌ Error al verificar la restauración:', errorConteo);
      return;
    }

    console.log(`📦 Total de artículos restaurados: ${totalArticulos}`);

    if (totalArticulos > 0) {
      // Obtener muestra de datos restaurados
      const { data: muestra, error: errorMuestra } = await supabase
        .from('inventario')
        .select('nombre, stock_actual, precio_costo, categoria')
        .limit(5);

      if (!errorMuestra && muestra) {
        console.log('\n📋 Muestra de artículos restaurados:');
        muestra.forEach((item, index) => {
          console.log(`${index + 1}. ${item.nombre}`);
          console.log(`   Stock: ${item.stock_actual}`);
          console.log(`   Precio: $${item.precio_costo}`);
          console.log(`   Categoría: ${item.categoria}`);
          console.log('');
        });
      }

      // Calcular estadísticas rápidas
      const { data: estadisticas, error: errorStats } = await supabase
        .from('inventario')
        .select('stock_actual, precio_costo');

      if (!errorStats && estadisticas) {
        const valorTotal = estadisticas.reduce(
          (sum, item) => sum + item.stock_actual * item.precio_costo,
          0
        );

        console.log(
          `💰 Valor total del inventario restaurado: $${valorTotal.toLocaleString('es-CL')}`
        );
      }

      console.log('\n🎉 ¡RESTAURACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('✅ Los datos han sido restaurados completamente');
      console.log('🔄 Refresca la página web para ver los datos actualizados');
    } else {
      console.log('\n❌ La restauración no fue exitosa');
      console.log('🔧 Revisa los errores anteriores y ejecuta manualmente el script SQL');
    }
  } catch (error) {
    console.error('\n💥 Error crítico durante la restauración:', error);
    console.log('\n🛠️  Solución alternativa:');
    console.log('1. Ve a Supabase Dashboard');
    console.log('2. Abre el SQL Editor');
    console.log('3. Ejecuta manualmente el archivo script-completo-implementacion.sql');
  }
}

// Ejecutar restauración
restaurarInventario();
