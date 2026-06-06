import SwiftUI
import PencilKit

struct MapEditorView: View {
    @State private var canvasView = PKCanvasView()
    @State private var activeTool: EditorTool = .pencil
    @State private var labels: [LabelItem] = []
    @State private var isReviewMode = false
    @State private var pendingPos: CGPoint? = nil
    @State private var labelText = ""
    @State private var showLabelDialog = false
    @State private var showSaveAlert = false

    var body: some View {
        GeometryReader { _ in
            ZStack(alignment: .bottom) {
                mapBackground

                PencilKitCanvas(
                    canvasView: $canvasView,
                    isEnabled: activeTool != .label
                )

                ForEach(labels) { label in
                    if !isReviewMode {
                        DraggableLabelView(label: label) { newPos in
                            moveLabel(id: label.id, to: newPos)
                        }
                    }
                }

                if activeTool == .label {
                    Color.clear
                        .contentShape(Rectangle())
                        .onTapGesture { loc in
                            pendingPos = loc
                            showLabelDialog = true
                        }
                }

                EditorToolbar(
                    activeTool: $activeTool,
                    isReviewMode: $isReviewMode,
                    onSave: saveSession,
                    onExport: exportImage
                )
                .padding(.bottom, 24)
            }
        }
        .ignoresSafeArea()
        .alert("ラベルを入力", isPresented: $showLabelDialog) {
            TextField("地名・王朝・出来事など", text: $labelText)
            Button("追加") { commitLabel() }
            Button("キャンセル", role: .cancel) { cancelLabel() }
        }
        .alert("保存しました", isPresented: $showSaveAlert) {
            Button("OK", role: .cancel) {}
        }
        .onAppear { loadSession() }
    }

    // MARK: - Background

    private var mapBackground: some View {
        ZStack {
            Color(red: 0.88, green: 0.95, blue: 1.0)
            Canvas { ctx, size in
                let step: CGFloat = 80
                var x: CGFloat = 0
                while x <= size.width {
                    var p = Path()
                    p.move(to: CGPoint(x: x, y: 0))
                    p.addLine(to: CGPoint(x: x, y: size.height))
                    ctx.stroke(p, with: .color(.blue.opacity(0.07)), lineWidth: 0.5)
                    x += step
                }
                var y: CGFloat = 0
                while y <= size.height {
                    var p = Path()
                    p.move(to: CGPoint(x: 0, y: y))
                    p.addLine(to: CGPoint(x: size.width, y: y))
                    ctx.stroke(p, with: .color(.blue.opacity(0.07)), lineWidth: 0.5)
                    y += step
                }
            }
            VStack(spacing: 8) {
                Text("世界史地図ノート")
                    .font(.system(size: 36, weight: .light))
                    .foregroundStyle(Color(red: 0.4, green: 0.55, blue: 0.75))
                Text("ペンで書き込み、ラベルモードでタップしてラベルを追加できます")
                    .font(.caption)
                    .foregroundStyle(Color(red: 0.55, green: 0.65, blue: 0.8))
            }
        }
    }

    // MARK: - Label actions

    private func commitLabel() {
        let trimmed = labelText.trimmingCharacters(in: .whitespaces)
        if let pos = pendingPos, !trimmed.isEmpty {
            labels.append(LabelItem(text: trimmed, position: pos))
        }
        labelText = ""
        pendingPos = nil
    }

    private func cancelLabel() {
        labelText = ""
        pendingPos = nil
    }

    private func moveLabel(id: UUID, to pos: CGPoint) {
        if let idx = labels.firstIndex(where: { $0.id == id }) {
            labels[idx].position = pos
        }
    }

    // MARK: - Persistence

    private func saveSession() {
        if let labelData = try? JSONEncoder().encode(labels) {
            UserDefaults.standard.set(labelData, forKey: "sc_labels_v1")
        }
        if let drawingData = try? canvasView.drawing.dataRepresentation() {
            UserDefaults.standard.set(drawingData, forKey: "sc_drawing_v1")
        }
        showSaveAlert = true
    }

    private func loadSession() {
        if let data = UserDefaults.standard.data(forKey: "sc_labels_v1"),
           let saved = try? JSONDecoder().decode([LabelItem].self, from: data) {
            labels = saved
        }
        if let data = UserDefaults.standard.data(forKey: "sc_drawing_v1"),
           let drawing = try? PKDrawing(data: data) {
            canvasView.drawing = drawing
        }
    }

    // MARK: - Export

    private func exportImage() {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = scene.windows.first,
              let root = window.rootViewController else { return }

        let bounds = window.bounds
        let format = UIGraphicsImageRendererFormat()
        format.scale = 2
        let renderer = UIGraphicsImageRenderer(bounds: bounds, format: format)
        let image = renderer.image { _ in
            window.layer.render(in: UIGraphicsGetCurrentContext()!)
        }

        let vc = UIActivityViewController(activityItems: [image], applicationActivities: nil)
        vc.popoverPresentationController?.sourceView = window
        root.present(vc, animated: true)
    }
}

struct DraggableLabelView: View {
    let label: LabelItem
    var onMove: (CGPoint) -> Void

    @GestureState private var drag = CGSize.zero

    var body: some View {
        Text(label.text)
            .font(.system(size: 14, weight: .semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.yellow.opacity(0.9))
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.orange.opacity(0.7), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 4))
            .position(x: label.position.x + drag.width,
                      y: label.position.y + drag.height)
            .gesture(
                DragGesture()
                    .updating($drag) { val, state, _ in state = val.translation }
                    .onEnded { val in
                        onMove(CGPoint(
                            x: label.position.x + val.translation.width,
                            y: label.position.y + val.translation.height
                        ))
                    }
            )
    }
}
