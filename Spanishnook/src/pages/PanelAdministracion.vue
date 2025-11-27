<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center flex flex-center q-pa-lg q-mb-md">
      <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo">
        PANEL DE ADMINISTRACIÓN - {{ seccionActual.toUpperCase() }}
      </p>
    </div>

    <!-- Menú lateral y contenido -->
    <div class="row q-col-gutter-lg">
      <!-- Menú lateral izquierdo -->
      <div class="col-12 col-md-3">
        <q-card class="sticky-menu">
          <q-list padding class="menu-lateral">
            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'calendario'"
              @click="cambiarSeccion('calendario')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="event" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Calendario</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'precios'"
              @click="cambiarSeccion('precios')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="attach_money" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Precios y Ofertas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'cursos'"
              @click="cambiarSeccion('cursos')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="school" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cursos </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'noticias'"
              @click="cambiarSeccion('noticias')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="article" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tarjetas y Noticias</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Contenido principal -->
      <div class="col-12 col-md-9">
        <!-- Sección Calendario -->
        <div v-if="seccionActual === 'calendario'">
          <!-- Controles principales -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-8">
              <q-btn-group>
                <q-btn
                  :color="seleccionMultiple ? 'primary' : 'grey'"
                  @click="activarSeleccionMultiple"
                  label="Selección múltiple"
                  icon="checklist"
                />
                <q-btn
                  :color="!seleccionMultiple ? 'primary' : 'grey'"
                  @click="activarSeleccionUnica"
                  label="Selección única"
                  icon="event"
                />
                <q-btn
                  color="positive"
                  icon="save"
                  label="Guardar cambios"
                  @click="grabarSeleccion"
                  :disabled="fechasSeleccionadas.length === 0"
                  :loading="guardando"
                />
                <q-btn
                  color="negative"
                  icon="delete"
                  label="Eliminar selección"
                  @click="eliminarSeleccion"
                  :disabled="fechasSeleccionadas.length === 0"
                />
              </q-btn-group>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="mesActual"
                type="text"
                label="Mes y año"
                @update:model-value="cambiarMes"
                filled
                :min="'2024-01'"
                :max="'2030-12'"
                mask="####-##"
                placeholder="YYYY-MM"
              />
            </div>
          </div>

          <!-- Leyenda -->
          <q-card class="q-mb-md">
            <q-card-section class="q-py-sm">
              <div class="row items-center q-gutter-md">
                <div class="text-caption text-weight-bold">Leyenda:</div>
                <div class="row items-center">
                  <q-icon name="square" color="blue" size="sm" />
                  <span class="q-ml-xs text-caption">Laborable</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="red" size="sm" />
                  <span class="q-ml-xs text-caption">Festivo</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="orange" size="sm" />
                  <span class="q-ml-xs text-caption">Especial</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="green" size="sm" />
                  <span class="q-ml-xs text-caption">Seleccionado</span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Calendario personalizado -->
          <q-card>
            <q-card-section>
              <!-- Encabezado del calendario -->
              <div class="row items-center justify-between q-mb-md">
                <div class="col-auto">
                  <q-btn icon="chevron_left" flat round @click="mesAnterior" color="primary" />
                </div>
                <div class="col text-center">
                  <div class="text-h6 text-weight-bold">{{ nombreMesActual }} {{ añoActual }}</div>
                </div>
                <div class="col-auto">
                  <q-btn icon="chevron_right" flat round @click="mesSiguiente" color="primary" />
                </div>
              </div>

              <!-- Días de la semana -->
              <div class="row q-mb-sm">
                <div
                  v-for="dia in diasSemana"
                  :key="dia"
                  class="col text-center text-weight-bold text-grey-7"
                >
                  {{ dia }}
                </div>
              </div>

              <!-- Días del mes -->
              <div class="calendario-grid">
                <div
                  v-for="(celda, index) in diasDelMes"
                  :key="index"
                  class="celda-dia"
                  :class="getClasesDia(celda)"
                  @click="seleccionarDia(celda)"
                >
                  <div v-if="celda" class="contenido-dia">
                    <div class="numero-dia">{{ celda.getDate() }}</div>
                    <div class="indicador-tipo" :class="getClaseTipoDia(celda)"></div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Panel de configuración -->
          <q-card v-if="fechasSeleccionadas.length > 0" class="q-mt-md">
            <q-card-section>
              <div class="text-h6">
                Configurar {{ fechasSeleccionadas.length }} día(s) seleccionado(s)
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Fechas seleccionadas:</div>
                <div class="q-gutter-sm">
                  <q-chip
                    v-for="fecha in fechasSeleccionadas"
                    :key="fecha"
                    color="primary"
                    text-color="white"
                    removable
                    @remove="removerFecha(fecha)"
                  >
                    {{ formatFechaDisplay(fecha) }}
                  </q-chip>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Formulario de configuración -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configuracion.tipoDia"
                    :options="opcionesTipoDia"
                    label="Tipo de día *"
                    filled
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Campo obligatorio']"
                  />
                </div>

                <!-- SELECTOR DE HORARIOS MÚLTIPLE -->
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configuracion.horariosSeleccionados"
                    :options="todosLosHorarios"
                    label="Horarios"
                    filled
                    multiple
                    use-chips
                    stack-label
                    clearable
                    placeholder="Selecciona horarios"
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configuracion.estado"
                    :options="['Habilitado', 'Deshabilitado', 'Pendiente']"
                    label="Estado"
                    filled
                  />
                </div>
              </div>

              <!-- Vista previa de horarios seleccionados -->
              <div v-if="configuracion.horariosSeleccionados.length > 0" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Horarios seleccionados:</div>
                <div class="q-gutter-sm">
                  <q-chip
                    v-for="horario in configuracion.horariosSeleccionados"
                    :key="horario"
                    color="secondary"
                    text-color="white"
                    removable
                    @remove="removerHorario(horario)"
                  >
                    {{ horario }}
                  </q-chip>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="row q-gutter-sm q-mt-lg">
                <q-btn
                  label="Aplicar configuración"
                  color="primary"
                  @click="aplicarConfiguracion"
                  class="col"
                  :disabled="!configuracion.tipoDia"
                />
                <q-btn
                  label="Limpiar selección"
                  color="grey"
                  @click="limpiarSeleccion"
                  class="col"
                  outline
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Precios y Ofertas -->
        <div v-if="seccionActual === 'precios'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Precios y Ofertas</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar los precios y ofertas del
                sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Cursos  -->
                <!-- Sección Cursos -->
        <div v-if="seccionActual === 'cursos'">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h4">Gestión de Cursos Grupales</div>
            <q-btn
              color="primary"
              icon="add"
              label="Nuevo Curso"
              @click="abrirDialogNuevoCurso"
              unelevated
            />
          </div>

          <!-- Estado vacío -->
          <q-card v-if="cursosGrupales.length === 0" flat bordered class="q-pa-lg text-center">
            <q-icon name="school" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No hay cursos disponibles</div>
            <div class="text-body2 text-grey-6">
              Crea tu primer curso haciendo clic en "Nuevo Curso"
            </div>
          </q-card>

          <!-- Lista de cursos -->
          <q-list v-else bordered separator class="rounded-borders">
            <q-expansion-item
              v-for="curso in cursosGrupales"
              :key="curso.id ?? 0"
              :model-value="cursoExpandido === curso.id"
              @update:model-value="curso.id !== undefined && toggleCurso(curso.id)"
              expand-separator
              :header-class="
                curso.estado_curso === 'Activo'
                  ? 'bg-green-1'
                  : curso.estado_curso === 'Completo'
                    ? 'bg-blue-1'
                    : 'bg-grey-2'
              "
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-avatar
                    :color="curso.estado_curso === 'Activo' ? 'primary' : 'grey'"
                    text-color="white"
                    icon="school"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-h6">
                    {{ curso.nombre_curso }}
                    <q-badge :color="curso.estado_curso === 'Activo' ? 'positive' : 'grey'" class="q-ml-sm">
                      {{ curso.codigo_curso }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>
                    <q-chip size="sm" :color="getColorEstado(curso.estado_curso)" text-color="white" dense>
                      {{ curso.estado_curso }}
                    </q-chip>
                    <q-chip v-if="curso.nivel" size="sm" color="primary" text-color="white" dense class="q-ml-xs">
                      {{ curso.nivel }}
                    </q-chip>
                    <q-chip v-if="curso.precio_curso" size="sm" color="secondary" text-color="white" dense class="q-ml-xs">
                      {{ curso.precio_curso }}€
                    </q-chip>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn flat round dense icon="edit" color="primary" size="sm" />
                </q-item-section>
              </template>

              <!-- Formulario expandido -->
              <q-card flat>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <!-- Fila 1: Información básica -->
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="cursoFormulario.codigo_curso"
                        label="Código del curso *"
                        filled
                        dense
                        :rules="[(val) => !!val || 'Campo obligatorio']"
                      >
                        <template v-slot:prepend>
                          <q-icon name="tag" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="cursoFormulario.nombre_curso"
                        label="Nombre del curso *"
                        filled
                        dense
                        :rules="[(val) => !!val || 'Campo obligatorio']"
                      >
                        <template v-slot:prepend>
                          <q-icon name="title" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="cursoFormulario.estado_curso"
                        :options="estadosCurso"
                        label="Estado *"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="info" />
                        </template>
                      </q-select>
                    </div>

                    <!-- Fila 2: Nivel y capacidad -->
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="cursoFormulario.nivel"
                        :options="nivelesDisponibles"
                        label="Nivel"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="signal_cellular_alt" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-4">
                      <q-input
                        v-model.number="cursoFormulario.max_estudiantes"
                        label="Máx. estudiantes"
                        type="number"
                        filled
                        dense
                        min="1"
                      >
                        <template v-slot:prepend>
                          <q-icon name="group" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-4">
                      <q-input
                        v-model.number="cursoFormulario.precio_curso"
                        label="Precio (€)"
                        type="number"
                        filled
                        dense
                        min="0"
                        step="0.01"
                      >
                        <template v-slot:prepend>
                          <q-icon name="euro" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Fila 3: Fechas -->
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="cursoFormulario.fecha_inicio"
                        label="Fecha inicio"
                        type="date"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="cursoFormulario.fecha_fin"
                        label="Fecha fin"
                        type="date"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Fila 4: Días de la semana y Horarios -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="cursoFormulario.dias_semana"
                        :options="diasSemanaOpciones"
                        label="Días de la semana"
                        filled
                        dense
                        multiple
                        use-chips
                        counter
                        hint="Selecciona los días en que se imparte el curso"
                      >
                        <template v-slot:prepend>
                          <q-icon name="calendar_month" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="cursoFormulario.horarios_curso"
                        :options="horariosDisponibles"
                        label="Horarios"
                        filled
                        dense
                        multiple
                        use-chips
                        counter
                        emit-value
                        map-options
                        options-dense
                        hint="Selecciona los horarios disponibles"
                      >
                        <template v-slot:prepend>
                          <q-icon name="schedule" />
                        </template>
                        <template v-slot:selected-item="scope">
                          <q-chip
                            removable
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            color="primary"
                            text-color="white"
                            dense
                            class="q-ma-xs"
                          >
                            {{ scope.opt }}
                          </q-chip>
                        </template>
                      </q-select>
                    </div>

                    <!-- Fila 5: Descripción -->
                    <div class="col-12">
                      <q-input
                        v-model="cursoFormulario.descripcion"
                        label="Descripción"
                        type="textarea"
                        filled
                        dense
                        rows="3"
                      >
                        <template v-slot:prepend>
                          <q-icon name="description" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Fila 6: Información de la tarjeta -->
                    <div class="col-12">
                      <q-separator class="q-my-md" />
                      <div class="text-subtitle1 text-weight-medium q-mb-sm">Información de la tarjeta</div>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="cursoFormulario.titulo_tarjeta"
                        label="Título de la tarjeta"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="badge" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="cursoFormulario.boton_tarjeta"
                        label="Texto del botón"
                        filled
                        dense
                        placeholder="Más información"
                      >
                        <template v-slot:prepend>
                          <q-icon name="smart_button" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-input
                        v-model="cursoFormulario.imagen_tarjeta"
                        label="URL de la imagen"
                        filled
                        dense
                        placeholder="https://ejemplo.com/imagen.jpg"
                      >
                        <template v-slot:prepend>
                          <q-icon name="image" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Fila 7: Usuarios (array) -->
                    <div class="col-12">
                      <q-separator class="q-my-md" />
                      <div class="text-subtitle1 text-weight-medium q-mb-sm">Usuarios inscritos</div>
                    </div>

                    <div class="col-12">
                      <q-select
                        v-model="cursoFormulario.usuarios"
                        label="Usuarios"
                        filled
                        dense
                        multiple
                        use-chips
                        use-input
                        new-value-mode="add-unique"
                        input-debounce="0"
                        hint="Escribe el email y presiona Enter"
                      >
                        <template v-slot:prepend>
                          <q-icon name="people" />
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <!-- Botones de acción -->
                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      label="Guardar cambios"
                      color="primary"
                      icon="save"
                      @click="guardarCurso"
                      :loading="guardandoCurso"
                      unelevated
                    />
                    <q-btn
                      label="Eliminar curso"
                      color="negative"
                      icon="delete"
                      @click="eliminarCurso(curso.id!)"
                      outline
                    />
                    <q-btn label="Cancelar" color="grey" @click="cursoExpandido = null" flat />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>

          <!-- Dialog para nuevo curso -->
          <q-dialog v-model="dialogNuevoCurso" persistent>
            <q-card style="min-width: 700px; max-width: 90vw">
              <q-card-section class="row items-center">
                <div class="text-h6">Crear Nuevo Curso</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-separator />

              <q-card-section style="max-height: 70vh" class="scroll">
                <div class="row q-col-gutter-md">
                  <!-- Información básica -->
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="cursoFormulario.codigo_curso"
                      label="Código del curso *"
                      filled
                      :rules="[(val) => !!val || 'Campo obligatorio']"
                    />
                  </div>

                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="cursoFormulario.nombre_curso"
                      label="Nombre del curso *"
                      filled
                      :rules="[(val) => !!val || 'Campo obligatorio']"
                    />
                  </div>

                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="cursoFormulario.estado_curso"
                      :options="estadosCurso"
                      label="Estado"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="cursoFormulario.nivel"
                      :options="nivelesDisponibles"
                      label="Nivel"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="cursoFormulario.precio_curso"
                      label="Precio (€)"
                      type="number"
                      filled
                      min="0"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="cursoFormulario.fecha_inicio"
                      label="Fecha inicio"
                      type="date"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input v-model="cursoFormulario.fecha_fin" label="Fecha fin" type="date" filled />
                  </div>

                  <!-- Días y horarios -->
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="cursoFormulario.dias_semana"
                      :options="diasSemanaOpciones"
                      label="Días de la semana"
                      filled
                      multiple
                      use-chips
                      counter
                      hint="Días en que se imparte"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="cursoFormulario.horarios_curso"
                      :options="horariosDisponibles"
                      label="Horarios"
                      filled
                      multiple
                      use-chips
                      counter
                      emit-value
                      map-options
                      options-dense
                      hint="Horarios disponibles"
                    >
                      <template v-slot:selected-item="scope">
                        <q-chip
                          removable
                          @remove="scope.removeAtIndex(scope.index)"
                          :tabindex="scope.tabindex"
                          color="primary"
                          text-color="white"
                          dense
                          class="q-ma-xs"
                        >
                          {{ scope.opt }}
                        </q-chip>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model.number="cursoFormulario.max_estudiantes"
                      label="Máx. estudiantes"
                      type="number"
                      filled
                      min="1"
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="cursoFormulario.descripcion"
                      label="Descripción"
                      type="textarea"
                      filled
                      rows="3"
                    />
                  </div>

                  <!-- Información de la tarjeta -->
                  <div class="col-12">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle1 text-weight-medium">Información de la tarjeta</div>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input v-model="cursoFormulario.titulo_tarjeta" label="Título tarjeta" filled />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="cursoFormulario.boton_tarjeta"
                      label="Texto del botón"
                      filled
                      placeholder="Más información"
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="cursoFormulario.imagen_tarjeta"
                      label="URL de la imagen"
                      filled
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn label="Cancelar" color="grey" flat @click="cerrarDialogNuevoCurso" />
                <q-btn
                  label="Crear Curso"
                  color="primary"
                  @click="guardarCurso"
                  :loading="guardandoCurso"
                  unelevated
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
        <!-- Sección Cursos  -->
        <div v-if="seccionActual === 'tarjetas'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md"> Tarjetas</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar los cursos y tarjetas del
                sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>
        <!-- Sección Noticias -->
        <div v-if="seccionActual === 'noticias'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Noticias</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar las noticias del sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Interfaces
interface EntradaCalendario {
  id?: number;
  tipo_dia: string;
  horario: string | null;
  estado: string;
  fecha: string;
  fecha_text: string;
  created_at?: string;
  updated_at?: string;
}

interface Configuracion {
  tipoDia: string;
  estado: string;
  horariosSeleccionados: string[];
}

interface OpcionTipoDia {
  label: string;
  value: string;
}

// ⬇️ REEMPLAZAR la interface CursoGrupal existente
interface CursoGrupal {
  id?: number;
  codigo_curso: string;
  nombre_curso: string;
  estado_curso: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  horarios_curso?: string[];
  dias_semana?: string[];
  descripcion?: string;
  usuarios?: string[];
  imagen_tarjeta?: string;
  titulo_tarjeta?: string;
  boton_tarjeta?: string;
  nivel?: string;
  max_estudiantes?: number;
  precio_curso?: number;
  created_at?: string;
  updated_at?: string;
}



const $q = useQuasar();

// Estado de la aplicación
const seccionActual = ref<string>('calendario');
const user = ref<User | null>(null);
const seleccionMultiple = ref<boolean>(true);
const guardando = ref<boolean>(false);
const mesActual = ref<string>(new Date().toISOString().slice(0, 7));
const fechasSeleccionadas = ref<string[]>([]);
const datosCalendario = ref<EntradaCalendario[]>([]);
const cursosGrupales = ref<CursoGrupal[]>([]);
const cursoExpandido = ref<number | null>(null);
const dialogNuevoCurso = ref<boolean>(false);
const editandoCurso = ref<boolean>(false);
const guardandoCurso = ref<boolean>(false);

const cursoFormulario = ref<CursoGrupal>({
  codigo_curso: '',
  nombre_curso: '',
  estado_curso: 'Activo',
  fecha_inicio: '',
  fecha_fin: '',
  dias_semana: [], // ⬅️ CAMBIADO a array vacío
  horarios_curso: [], // ⬅️ CAMBIADO a array vacío
  descripcion: '',
  usuarios: [],
  imagen_tarjeta: '',
  titulo_tarjeta: '',
  boton_tarjeta: 'Más información',
  nivel: 'Principiante',
  max_estudiantes: 10,
  precio_curso: 0,
});

const diasSemanaOpciones = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
];

const horariosDisponibles = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

const nivelesDisponibles = ['Principiante', 'Elemental', 'Intermedio', 'Avanzado', 'Nativo'];
const estadosCurso = ['Activo', 'En reserva', 'Finalizado', 'Completo', 'En preparación'];

// Configuración
const configuracion = ref<Configuracion>({
  tipoDia: '',
  estado: 'Habilitado',
  horariosSeleccionados: [],
});

// Opciones
const opcionesTipoDia: OpcionTipoDia[] = [
  { label: 'Laborable', value: 'laborable' },
  { label: 'Festivo', value: 'festivo' },
  { label: 'Especial', value: 'especial' },
];

// Horarios predefinidos
const todosLosHorarios = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

// Constantes
const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Computed
const fechaActual = computed(() => new Date(mesActual.value + '-01'));
const nombreMesActual = computed(() => {
  return fechaActual.value.toLocaleDateString('es-ES', { month: 'long' });
});
const añoActual = computed(() => fechaActual.value.getFullYear());

const diasDelMes = computed(() => {
  const year = fechaActual.value.getFullYear();
  const month = fechaActual.value.getMonth();

  const primerDia = new Date(year, month, 1);
  const ultimoDia = new Date(year, month + 1, 0);

  const diasMesAnterior = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

  const dias: (Date | null)[] = [];

  for (let i = 0; i < diasMesAnterior; i++) {
    dias.push(null);
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    dias.push(new Date(year, month, dia));
  }

  return dias;
});

// Navegación entre secciones
const cambiarSeccion = (seccion: string): void => {
  seccionActual.value = seccion;
};

// Funciones del calendario
const mesAnterior = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() - 1);

  const minDate = new Date(2024, 0, 1);
  if (fecha >= minDate) {
    mesActual.value = fecha.toISOString().slice(0, 7);
  }
};

const mesSiguiente = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() + 1);
  
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1; // getMonth() es 0-indexed, sumamos 1
  
  // Formatear como YYYY-MM
  const mesStr = `${year}-${month.toString().padStart(2, '0')}`;
  
  console.log('Intentando avanzar a:', mesStr);
  console.log('Comparación:', mesStr, '<=', '2030-12', '=', mesStr <= '2030-12');
  
  // Permitir hasta 2030-12
  if (mesStr <= '2030-12') {
    mesActual.value = mesStr;
    console.log('Mes actualizado a:', mesActual.value);
  } else {
    console.log('Límite alcanzado, no se puede avanzar más');
    $q.notify({
      type: 'warning',
      message: 'Has alcanzado el límite máximo (Diciembre 2030)',
      timeout: 2000
    });
  }
};

const cambiarMes = (nuevoMes: string | number | null): void => {
  if (!nuevoMes || typeof nuevoMes !== 'string') return;
  
  // Validar formato YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(nuevoMes)) return;
  
  // Validar rango
  if (nuevoMes >= '2024-01' && nuevoMes <= '2030-12') {
    mesActual.value = nuevoMes;
  } else {
    $q.notify({
      type: 'warning',
      message: 'El mes debe estar entre Enero 2024 y Diciembre 2030',
      timeout: 2000
    });
  }
};

// Selección de días
const seleccionarDia = (fecha: Date | null): void => {
  if (!fecha) return;

  const fechaStr = fecha.toISOString().split('T')[0];
  if (!fechaStr) return;

  if (seleccionMultiple.value) {
    const index = fechasSeleccionadas.value.indexOf(fechaStr);
    if (index > -1) {
      fechasSeleccionadas.value.splice(index, 1);
    } else {
      fechasSeleccionadas.value.push(fechaStr);
    }
  } else {
    fechasSeleccionadas.value = [fechaStr];
  }

  // ⬇️ NUEVO: Cargar configuración automáticamente al seleccionar
  cargarConfiguracionAutomatica();
};

// ⬇️ NUEVA FUNCIÓN: Cargar configuración automática
const cargarConfiguracionAutomatica = (): void => {
  if (fechasSeleccionadas.value.length === 0) {
    limpiarSeleccion();
    return;
  }

  // Si hay una sola fecha seleccionada
  if (fechasSeleccionadas.value.length === 1) {
    const fechaStr = fechasSeleccionadas.value[0];
    if (!fechaStr) return;

    // Buscar si ya existe configuración para esta fecha
    const entradaExistente = datosCalendario.value.find((item) => item.fecha === fechaStr);

    if (entradaExistente) {
      // Cargar configuración existente
      configuracion.value.tipoDia = entradaExistente.tipo_dia;
      configuracion.value.estado = entradaExistente.estado;

      // Parsear horarios desde string a array
      if (entradaExistente.horario) {
        try {
          // Si horario es string como "{09:00,10:00}", convertir a array
          if (typeof entradaExistente.horario === 'string') {
            const horariosStr = entradaExistente.horario.replace(/[{}]/g, '');
            configuracion.value.horariosSeleccionados = horariosStr
              .split(',')
              .map((h) => h.trim().replace(/"/g, ''))
              .filter((h) => h.length > 0);
          } else {
            configuracion.value.horariosSeleccionados = [];
          }
        } catch (error) {
          console.error('Error al parsear horarios:', error);
          configuracion.value.horariosSeleccionados = [];
        }
      } else {
        configuracion.value.horariosSeleccionados = [];
      }
    } else {
      // Nueva fecha sin configuración: establecer valores por defecto
      configuracion.value.tipoDia = 'laborable';
      configuracion.value.estado = 'Habilitado';
      // ⬇️ AQUÍ: Asignar TODOS los horarios automáticamente para días laborables
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    }
  } else {
    // Múltiples fechas seleccionadas: configuración por defecto
    configuracion.value.tipoDia = 'laborable';
    configuracion.value.estado = 'Habilitado';
    // ⬇️ AQUÍ: Asignar TODOS los horarios automáticamente para días laborables
    configuracion.value.horariosSeleccionados = [...todosLosHorarios];
  }
};



// Clases CSS
const getClasesDia = (fecha: Date | null): string => {
  if (!fecha) return 'dia-vacio';

  const clases = ['dia-calendario'];
  const fechaStr = fecha.toISOString().split('T')[0] ?? '';
  const hoy = new Date().toDateString();

  if (fecha.toDateString() === hoy) {
    clases.push('dia-hoy');
  }

  if (fechasSeleccionadas.value.includes(fechaStr)) {
    clases.push('dia-seleccionado');
  }

  return clases.join(' ');
};

const getClaseTipoDia = (fecha: Date): string => {
  const fechaStr = fecha.toISOString().split('T')[0];
  const entrada = datosCalendario.value.find((item) => item.fecha === fechaStr);

  if (!entrada) return '';

  switch (entrada.tipo_dia?.toLowerCase()) {
    case 'laborable':
      return 'tipo-laborable';
    case 'festivo':
      return 'tipo-festivo';
    case 'especial':
      return 'tipo-especial';
    default:
      return '';
  }
};

// Funciones auxiliares
const activarSeleccionMultiple = (): void => {
  seleccionMultiple.value = true;
};

const activarSeleccionUnica = (): void => {
  seleccionMultiple.value = false;
  if (fechasSeleccionadas.value.length > 1) {
    fechasSeleccionadas.value = fechasSeleccionadas.value.slice(0, 1);
  }
};

const removerFecha = (fecha: string): void => {
  fechasSeleccionadas.value = fechasSeleccionadas.value.filter((f) => f !== fecha);
};

const removerHorario = (horario: string): void => {
  configuracion.value.horariosSeleccionados = configuracion.value.horariosSeleccionados.filter(
    (h) => h !== horario,
  );
};

const formatFechaDisplay = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const aplicarConfiguracion = (): void => {
  console.log('Aplicando configuración:', {
    fechas: fechasSeleccionadas.value,
    configuracion: configuracion.value,
  });

  $q.notify({
    type: 'info',
    message: `Configuración aplicada a ${fechasSeleccionadas.value.length} día(s) - Guarda los cambios para aplicar en la base de datos`,
  });
};

const limpiarSeleccion = (): void => {
  fechasSeleccionadas.value = [];
  configuracion.value = {
    tipoDia: '',
    estado: 'Habilitado',
    horariosSeleccionados: [],
  };
};

// Funciones Supabase
const grabarSeleccion = async (): Promise<void> => {
  guardando.value = true;
  try {
    if (!fechasSeleccionadas.value || fechasSeleccionadas.value.length === 0) {
      throw new Error('No hay fechas seleccionadas');
    }

    if (!configuracion.value.tipoDia) {
      throw new Error('El tipo de día es obligatorio');
    }

    console.log('Intentando guardar en Supabase:', {
      fechas: fechasSeleccionadas.value,
      config: configuracion.value,
    });

    const resultados = [];

    for (const fecha of fechasSeleccionadas.value) {
      if (!fecha || typeof fecha !== 'string') {
        console.warn('Fecha inválida omitida:', fecha);
        continue;
      }

      const { data: existingData, error: selectError } = await supabase
        .from('Calendario')
        .select('id')
        .eq('fecha', fecha)
        .maybeSingle();

      if (selectError) {
        console.error('Error al verificar existencia:', selectError);
        throw selectError;
      }

      const horariosArray =
        configuracion.value.horariosSeleccionados.length > 0
          ? `{${configuracion.value.horariosSeleccionados.map((h) => `"${h}"`).join(',')}}`
          : null;

      const datosParaGuardar = {
        fecha: fecha,
        fecha_text: formatFechaDisplay(fecha),
        tipo_dia: configuracion.value.tipoDia,
        estado: configuracion.value.estado,
        horario: horariosArray,
        updated_at: new Date().toISOString(),
      };

      console.log(`Procesando fecha ${fecha}:`, {
        existe: !!existingData,
        datos: datosParaGuardar,
        horariosArray: horariosArray,
      });

      let resultado;
      if (existingData && existingData.id) {
        resultado = await supabase
          .from('Calendario')
          .update(datosParaGuardar)
          .eq('id', existingData.id);
      } else {
        resultado = await supabase.from('Calendario').insert([
          {
            ...datosParaGuardar,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      if (resultado.error) {
        console.error('Error en operación Supabase:', resultado.error);
        throw resultado.error;
      }

      resultados.push(resultado);
      console.log(`Operación exitosa para fecha ${fecha}`);
    }

    console.log('Todos los cambios guardados en Supabase:', resultados);

    $q.notify({
      type: 'positive',
      message: `${fechasSeleccionadas.value.length} día(s) guardado(s) correctamente en Supabase`,
      timeout: 3000,
    });

    await cargarDatosCalendario();
    limpiarSeleccion();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
    console.error('Error completo al guardar en Supabase:', error);
    $q.notify({
      type: 'negative',
      message: `Error al guardar: ${errorMessage}`,
      timeout: 5000,
    });
  } finally {
    guardando.value = false;
  }
};

const eliminarSeleccion = (): void => {
  try {
    if (!fechasSeleccionadas.value || fechasSeleccionadas.value.length === 0) {
      throw new Error('No hay fechas seleccionadas');
    }

    const fechasValidas = fechasSeleccionadas.value.filter(
      (fecha) => fecha && typeof fecha === 'string' && fecha.length > 0,
    );

    if (fechasValidas.length === 0) {
      throw new Error('No hay fechas válidas para eliminar');
    }

    console.log('Intentando eliminar fechas:', fechasValidas);

    $q.dialog({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar ${fechasValidas.length} día(s) del calendario?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          const { error } = await supabase.from('Calendario').delete().in('fecha', fechasValidas);

          if (error) {
            console.error('Error al eliminar:', error);
            throw error;
          }

          console.log(`Eliminados ${fechasValidas.length} registros`);

          $q.notify({
            type: 'positive',
            message: `${fechasValidas.length} día(s) eliminado(s) correctamente`,
            timeout: 3000,
          });

          await cargarDatosCalendario();
          limpiarSeleccion();
        } catch (innerError: unknown) {
          const errorMessage =
            innerError instanceof Error ? innerError.message : 'Error desconocido al eliminar';
          console.error('Error al eliminar:', innerError);
          $q.notify({
            type: 'negative',
            message: `Error al eliminar: ${errorMessage}`,
            timeout: 5000,
          });
        }
      })();
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al eliminar:', error);
    $q.notify({
      type: 'negative',
      message: `Error al eliminar: ${errorMessage}`,
      timeout: 5000,
    });
  }
};

// Cargar datos de Supabase
const cargarDatosCalendario = async (): Promise<void> => {
  try {
    console.log('Cargando datos del calendario desde Supabase...');

    const { data, error } = await supabase
      .from('Calendario')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error de Supabase al cargar:', error);
      throw error;
    }

    datosCalendario.value = data || [];
    console.log('Datos del calendario cargados:', datosCalendario.value.length, 'registros');
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido al cargar datos';
    console.error('Error al cargar datos:', error);
    $q.notify({
      type: 'negative',
      message: `Error al cargar los datos del calendario: ${errorMessage}`,
    });
  }
};

// Cargar usuario actual
const cargarUsuario = async (): Promise<void> => {
  try {
    const {
      data: { user: userData },
    } = await supabase.auth.getUser();
    user.value = userData;
    console.log('Usuario cargado:', userData?.email);
  } catch (error: unknown) {
    console.error('Error al cargar usuario:', error);
  }
};

// Inicialización
let subscription: ReturnType<typeof supabase.channel> | null = null;

// Funciones para gestionar cursos grupales
const cargarCursosGrupales = async (): Promise<void> => {
  try {
    console.log('Cargando cursos grupales desde Supabase...');

    const { data, error } = await supabase
      .from('cursos_grupales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar cursos:', error);
      throw error;
    }

    // ⬇️ PARSEAR ARRAYS CORRECTAMENTE
    cursosGrupales.value = (data || []).map((curso) => ({
      ...curso,
      // Asegurar que dias_semana sea un array válido
      dias_semana: Array.isArray(curso.dias_semana) 
        ? curso.dias_semana 
        : curso.dias_semana 
          ? [curso.dias_semana] 
          : [],
      // Asegurar que horarios_curso sea un array válido
      horarios_curso: Array.isArray(curso.horarios_curso)
        ? curso.horarios_curso
        : curso.horarios_curso
          ? [curso.horarios_curso]
          : [],
      // Asegurar que usuarios sea un array válido
      usuarios: Array.isArray(curso.usuarios)
        ? curso.usuarios
        : curso.usuarios
          ? [curso.usuarios]
          : [],
    }));

    console.log('Cursos cargados y parseados:', cursosGrupales.value.length);
    console.log('Ejemplo de curso parseado:', cursosGrupales.value[0]);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    $q.notify({
      type: 'negative',
      message: `Error al cargar cursos: ${errorMessage}`,
      timeout: 3000,
    });
  }
};

const toggleCurso = (id: number): void => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;

  if (cursoExpandido.value === id) {
    const curso = cursosGrupales.value.find((c) => c.id === id);
    if (curso) {
      console.log('Curso encontrado:', curso);
      console.log('horarios_curso original:', curso.horarios_curso);
      
      // ⬇️ DEEP CLONE con JSON para asegurar arrays independientes
      const horariosArray = Array.isArray(curso.horarios_curso) 
        ? JSON.parse(JSON.stringify(curso.horarios_curso))
        : [];
      
      const diasArray = Array.isArray(curso.dias_semana)
        ? JSON.parse(JSON.stringify(curso.dias_semana))
        : [];
      
      const usuariosArray = Array.isArray(curso.usuarios)
        ? JSON.parse(JSON.stringify(curso.usuarios))
        : [];
      
      cursoFormulario.value = {
        ...curso,
        dias_semana: diasArray,
        horarios_curso: horariosArray,
        usuarios: usuariosArray,
      };
      
      console.log('Formulario después de asignar:', cursoFormulario.value);
      console.log('horarios_curso en formulario:', cursoFormulario.value.horarios_curso);
      console.log('Es array?', Array.isArray(cursoFormulario.value.horarios_curso));
      
      editandoCurso.value = true;
    }
  } else {
    editandoCurso.value = false;
  }
};

const abrirDialogNuevoCurso = (): void => {
  cursoFormulario.value = {
    codigo_curso: '',
    nombre_curso: '',
    estado_curso: 'Activo',
    fecha_inicio: '',
    fecha_fin: '',
    dias_semana: [],
    horarios_curso: [],
    descripcion: '',
    usuarios: [],
    imagen_tarjeta: '',
    titulo_tarjeta: '',
    boton_tarjeta: 'Más información',
    nivel: 'Principiante',
    max_estudiantes: 10,
    precio_curso: 0,
  };
  editandoCurso.value = false;
  dialogNuevoCurso.value = true;
};

const cerrarDialogNuevoCurso = (): void => {
  dialogNuevoCurso.value = false;
};

const guardarCurso = async (): Promise<void> => {
  if (!cursoFormulario.value.codigo_curso || !cursoFormulario.value.nombre_curso) {
    $q.notify({
      type: 'warning',
      message: 'El código y nombre del curso son obligatorios',
      timeout: 2000,
    });
    return;
  }

  guardandoCurso.value = true;

  try {
    // ⬇️ ASEGURAR QUE LOS ARRAYS ESTÉN BIEN FORMATEADOS
    const datosGuardar = {
      codigo_curso: cursoFormulario.value.codigo_curso,
      nombre_curso: cursoFormulario.value.nombre_curso,
      estado_curso: cursoFormulario.value.estado_curso,
      fecha_inicio: cursoFormulario.value.fecha_inicio || null,
      fecha_fin: cursoFormulario.value.fecha_fin || null,
      // ⬇️ CONVERTIR A ARRAY DE POSTGRESQL
      dias_semana: Array.isArray(cursoFormulario.value.dias_semana) 
        ? cursoFormulario.value.dias_semana 
        : [],
      horarios_curso: Array.isArray(cursoFormulario.value.horarios_curso)
        ? cursoFormulario.value.horarios_curso
        : [],
      descripcion: cursoFormulario.value.descripcion || null,
      usuarios: Array.isArray(cursoFormulario.value.usuarios)
        ? cursoFormulario.value.usuarios
        : [],
      imagen_tarjeta: cursoFormulario.value.imagen_tarjeta || null,
      titulo_tarjeta: cursoFormulario.value.titulo_tarjeta || null,
      boton_tarjeta: cursoFormulario.value.boton_tarjeta || 'Más información',
      nivel: cursoFormulario.value.nivel || null,
      max_estudiantes: cursoFormulario.value.max_estudiantes || null,
      precio_curso: cursoFormulario.value.precio_curso || null,
    };

    console.log('Datos a guardar:', datosGuardar);

    let resultado;

    if (editandoCurso.value && cursoFormulario.value.id) {
      // ACTUALIZAR
      resultado = await supabase
        .from('cursos_grupales')
        .update(datosGuardar)
        .eq('id', cursoFormulario.value.id)
        .select(); // ⬅️ AÑADIR .select() para ver el resultado

      if (resultado.error) {
        console.error('Error al actualizar:', resultado.error);
        throw resultado.error;
      }

      $q.notify({
        type: 'positive',
        message: 'Curso actualizado correctamente',
        timeout: 2000,
      });
    } else {
      // CREAR
      resultado = await supabase
        .from('cursos_grupales')
        .insert([datosGuardar])
        .select(); // ⬅️ AÑADIR .select() para ver el resultado

      if (resultado.error) {
        console.error('Error al insertar:', resultado.error);
        throw resultado.error;
      }

      $q.notify({
        type: 'positive',
        message: 'Curso creado correctamente',
        timeout: 2000,
      });

      dialogNuevoCurso.value = false;
    }

    console.log('Resultado de Supabase:', resultado);

    await cargarCursosGrupales();
    cursoExpandido.value = null;
    editandoCurso.value = false;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error completo al guardar curso:', error);
    
    // ⬇️ MOSTRAR MÁS DETALLES DEL ERROR
    if (error && typeof error === 'object' && 'details' in error) {
      console.error('Detalles del error:', (error as { details: unknown }).details);
    }
    
    $q.notify({
      type: 'negative',
      message: `Error al guardar: ${errorMessage}`,
      timeout: 5000,
    });
  } finally {
    guardandoCurso.value = false;
  }
};


  // Remover 'async' ya que el código asíncrono está en el callback interno
const eliminarCurso = (id: number): void => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.',
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
    },
  }).onOk(() => {
    void (async () => {
      try {
        const { error } = await supabase.from('cursos_grupales').delete().eq('id', id);

        if (error) throw error;

        $q.notify({
          type: 'positive',
          message: 'Curso eliminado correctamente',
          timeout: 2000,
        });

        await cargarCursosGrupales();
        cursoExpandido.value = null;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al eliminar curso:', error);
        $q.notify({
          type: 'negative',
          message: `Error al eliminar: ${errorMessage}`,
          timeout: 3000,
        });
      }
    })();
  });
};

onMounted(async (): Promise<void> => {
  await cargarUsuario();
  await cargarDatosCalendario();
  await cargarCursosGrupales(); // ⬅️ AÑADIR ESTA LÍNEA

  subscription = supabase
    .channel('calendario-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Calendario',
      },
      () => {
        console.log('Cambio en tiempo real detectado');
        void cargarDatosCalendario();
      },
    )
    .subscribe();
});

const getColorEstado = (estado: string): string => {
  switch (estado) {
    case 'Activo':
      return 'positive';
    case 'Completo':
      return 'blue';
    case 'Finalizado':
      return 'grey-7';
    case 'En reserva':
      return 'orange';
    case 'En preparación':
      return 'purple';
    default:
      return 'grey';
  }
};

onUnmounted(() => {
  if (subscription) {
    void subscription.unsubscribe();
  }
});
watch(
  () => configuracion.value.tipoDia,
  (nuevoTipo, tipoAnterior) => {
    // Solo aplicar si hay cambio real
    if (nuevoTipo === tipoAnterior) return;

    if (nuevoTipo === 'laborable') {
      // Al cambiar a laborable, asignar todos los horarios
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    } else if (nuevoTipo === 'festivo' || nuevoTipo === 'especial') {
      // Al cambiar a festivo o especial, limpiar horarios
      configuracion.value.horariosSeleccionados = [];
    }
  }
);
</script>

<style scoped>
/* 🔧 SOLUCIÓN DEFINITIVA PARA TAMAÑOS DE CELDAS */

/* ⬇️ CONTROLAR ANCHO MEDIANTE EL GRID */
.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  width: 100%;
}

/* ⬇️ CELDAS CON ANCHO AUTOMÁTICO BASADO EN EL GRID */
.celda-dia {
  width: 100%;
  height: 50px;
  border-radius: 8px;
}

.dia-calendario {
  border: 2px solid #e0e0e0;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dia-calendario:hover {
  background-color: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.dia-seleccionado {
  background: linear-gradient(135deg, #4caf50, #388e3c) !important;
  border-color: #2e7d32 !important;
  color: white;
  transform: scale(1.05);
}

.dia-hoy {
  border: 3px solid #ff9800 !important;
  background-color: #fff3e0 !important;
  font-weight: bold;
}

.dia-vacio {
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
  cursor: default;
}

.contenido-dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 6px;
}

.numero-dia {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
}

.dia-seleccionado .numero-dia {
  color: white;
  font-weight: 700;
}

/* 🔴 INDICADORES MÁS VISIBLES */
.indicador-tipo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tipo-laborable {
  background-color: #2196f3;
}

.tipo-festivo {
  background-color: #f44336;
}

.tipo-especial {
  background-color: #ff9800;
}

.dia-seleccionado .indicador-tipo {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 🔧 MENÚ LATERAL */
.sticky-menu {
  position: sticky;
  top: 20px;
  z-index: 100;
}

.menu-lateral {
  border-radius: 8px;
}

.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #e3f2fd;
  transform: translateX(5px);
}

.menu-item.q-item--active {
  background-color: #1976d2;
  color: white;
}

.menu-item.q-item--active .q-icon {
  color: white;
}

/* 📱 RESPONSIVE MEJORADO */
@media (max-width: 1024px) {
  .celda-dia {
    height: 70px;
    padding: 4px;
  }

  .numero-dia {
    font-size: 1rem;
  }

  .indicador-tipo {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 768px) {
  .calendario-grid {
    gap: 2px;
  }

  .celda-dia {
    height: 60px;
    padding: 3px;
  }

  .numero-dia {
    font-size: 0.9rem;
  }

  .indicador-tipo {
    width: 16px;
    height: 16px;
  }

  .contenido-dia {
    gap: 4px;
  }

  .sticky-menu {
    position: relative;
    top: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .celda-dia {
    height: 50px;
    padding: 2px;
  }

  .numero-dia {
    font-size: 0.8rem;
  }

  .indicador-tipo {
    width: 14px;
    height: 14px;
    border-width: 1px;
  }

  .contenido-dia {
    gap: 2px;
  }
}

/* 🔧 FORZAR TAMAÑOS EN CASO DE CONFLICTOS */
:deep(.q-page) {
  min-height: calc(100vh - 50px);
}

:deep(.q-card) {
  overflow: visible;
}

:deep(.q-card-section) {
  padding: 16px;
}

/* Estilos para estados de carga */
.celda-dia.cargando {
  opacity: 0.6;
  cursor: wait;
}

.celda-dia.deshabilitado {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Efectos visuales mejorados */
.dia-calendario:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Animación para nuevos días seleccionados */
@keyframes seleccionarDia {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}

.dia-seleccionado {
  animation: seleccionarDia 0.3s ease-out;
}

/* Mejora para días vacíos */
.dia-vacio:hover {
  transform: none;
  background-color: #f5f5f5;
  cursor: default;
}

/* Asegurar que el grid ocupe espacio consistente */
.calendario-grid::after {
  content: '';
  flex: auto;
}

/* Contenedor principal del calendario */
:deep(.calendario-container) {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

/* Estilos para las secciones de contenido */
.seccion-contenido {
  min-height: 600px;
}
</style>
